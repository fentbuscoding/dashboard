import logging
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from datetime import datetime
import threading
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class Database:
    """Database connection and operations manager"""
    
    def __init__(self, app=None):
        self.client = None
        self.db = None
        self.available = False
        self._lock = threading.Lock()
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize database with Flask app"""
        self.app = app
        self.connect()
        
        # Register teardown handler
        app.teardown_appcontext(self.close_connection)
    
    def connect(self):
        """Establish database connection"""
        try:
            mongo_uri = self.app.config.get('MONGO_URI')
            if not mongo_uri:
                logger.warning("No MongoDB URI provided, running without database")
                return False
            
            self.client = MongoClient(
                mongo_uri,
                serverSelectionTimeoutMS=self.app.config.get('MONGO_SERVER_SELECTION_TIMEOUT', 5000),
                connectTimeoutMS=self.app.config.get('MONGO_CONNECT_TIMEOUT', 5000),
                maxPoolSize=50,
                minPoolSize=5,
                maxIdleTimeMS=30000,
                socketTimeoutMS=20000,
                heartbeatFrequencyMS=10000
            )
            
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client.bronxbot
            self.available = True
            logger.info("MongoDB connection established successfully")
            return True
            
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            logger.error(f"MongoDB connection failed: {e}")
            self.available = False
            return False
        except Exception as e:
            logger.error(f"Unexpected database error: {e}")
            self.available = False
            return False
    
    def close_connection(self, exception=None):
        """Close database connection"""
        if self.client:
            self.client.close()
    
    @contextmanager
    def get_collection(self, collection_name):
        """Context manager for database operations"""
        if not self.available or self.db is None:
            raise ConnectionError("Database not available")
        
        try:
            collection = self.db[collection_name]
            yield collection
        except Exception as e:
            logger.error(f"Database operation failed: {e}")
            raise
    
    def is_available(self):
        """Check if database is available"""
        return self.available
    
    # Stats operations
    def get_stats(self):
        """Get bot statistics"""
        if not self.available:
            return self._get_default_stats()
        
        try:
            with self.get_collection('bot_stats') as collection:
                stats_doc = collection.find_one({"_id": "global_stats"})
                if stats_doc:
                    return self._format_stats(stats_doc)
                return self._get_default_stats()
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return self._get_default_stats()
    
    def update_stats(self, stats_data):
        """Update bot statistics"""
        if not self.available:
            return False
        
        try:
            with self.get_collection('bot_stats') as collection:
                result = collection.update_one(
                    {"_id": "global_stats"},
                    {"$set": {**stats_data, "last_update": datetime.now()}},
                    upsert=True
                )
                return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating stats: {e}")
            return False
    
    # Guild operations
    def get_guild_settings(self, guild_id):
        """Get guild settings"""
        if not self.available:
            return self._get_default_guild_settings()
        
        try:
            with self.get_collection('guild_settings') as collection:
                settings = collection.find_one({"_id": str(guild_id)})
                return settings or self._get_default_guild_settings()
        except Exception as e:
            logger.error(f"Error getting guild settings: {e}")
            return self._get_default_guild_settings()
    
    def update_guild_settings(self, guild_id, settings):
        """Update guild settings"""
        if not self.available:
            return False
        
        try:
            with self.get_collection('guild_settings') as collection:
                result = collection.update_one(
                    {"_id": str(guild_id)},
                    {"$set": {**settings, "updated_at": datetime.now()}},
                    upsert=True
                )
                return result.acknowledged
        except Exception as e:
            logger.error(f"Error updating guild settings: {e}")
            return False
    
    # User operations
    def get_user_data(self, user_id):
        """Get user data"""
        if not self.available:
            return {"balance": 0, "bank": 0}
        
        try:
            with self.get_collection('users') as collection:
                user_data = collection.find_one({"_id": str(user_id)})
                if user_data:
                    return {
                        "balance": user_data.get("balance", 0),
                        "bank": user_data.get("bank", 0),
                        "lastfm": user_data.get("lastfm")
                    }
                return {"balance": 0, "bank": 0}
        except Exception as e:
            logger.error(f"Error getting user data: {e}")
            return {"balance": 0, "bank": 0}
    
    def get_bot_guilds(self):
        """Get bot guild list from database"""
        if not self.available:
            return []
        
        try:
            with self.get_collection('bot_stats') as collection:
                stats_doc = collection.find_one({"_id": "global_stats"})
                if stats_doc and "guild_list" in stats_doc:
                    return stats_doc["guild_list"]
                return []
        except Exception as e:
            logger.error(f"Error getting bot guilds: {e}")
            return []
    
    def _get_default_stats(self):
        """Get default stats structure"""
        return {
            "uptime": {"days": 0, "hours": 0, "minutes": 0, "total_seconds": 0},
            "guilds": {"count": 0, "history": [], "list": [], "detailed": []},
            "commands": {"total_executed": 0, "daily_metrics": [], "command_types": {}, "daily_count": 0},
            "performance": {"user_count": 0, "latency": 0, "shard_count": 1},
            "last_updated": datetime.now().isoformat()
        }
    
    def _get_default_guild_settings(self):
        """Get default guild settings"""
        return {
            'prefixes': ['.'],
            'welcome': {
                'enabled': False,
                'channel_id': None,
                'message': 'Welcome to the server!'
            },
            'moderation': {
                'log_channel': None,
                'mute_role': None,
                'jail_role': None
            }
        }
    
    def _format_stats(self, stats_doc):
        """Format MongoDB stats document"""
        # Implement stats formatting logic here
        return stats_doc