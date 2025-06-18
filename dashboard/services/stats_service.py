import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class StatsService:
    """Service for handling bot statistics"""
    
    def __init__(self, db):
        self.db = db
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get formatted stats for dashboard display"""
        try:
            if self.db.is_available():
                stats = self.db.get_stats()
            else:
                stats = self._get_fallback_stats()
            
            return self._format_stats_for_display(stats)
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {e}")
            return self._get_fallback_stats()
    
    def update_command_stats(self, command_data: Dict[str, Any]) -> bool:
        """Update command statistics"""
        try:
            if not self.db.is_available():
                return False
            
            # Process command data
            stats_update = self._process_command_data(command_data)
            return self.db.update_stats(stats_update)
        except Exception as e:
            logger.error(f"Error updating command stats: {e}")
            return False
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics"""
        try:
            if self.db.is_available():
                with self.db.get_collection('bot_stats') as collection:
                    stats = collection.find_one({"_id": "global_stats"})
                    if stats:
                        return self._extract_performance_metrics(stats)
            
            return self._get_default_performance_metrics()
        except Exception as e:
            logger.error(f"Error getting performance metrics: {e}")
            return self._get_default_performance_metrics()
    
    def _format_stats_for_display(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Format stats for display in templates"""
        return {
            "uptime": stats.get("uptime", {}),
            "guilds": stats.get("guilds", {}),
            "commands": stats.get("commands", {}),
            "performance": stats.get("performance", {}),
            "last_updated": stats.get("last_updated", datetime.now().isoformat())
        }
    
    def _get_fallback_stats(self) -> Dict[str, Any]:
        """Get fallback stats when database is unavailable"""
        return {
            "uptime": {"days": 0, "hours": 0, "minutes": 0, "total_seconds": 0},
            "guilds": {"count": 0, "history": [], "list": [], "detailed": []},
            "commands": {"total_executed": 0, "daily_metrics": [], "command_types": {}, "daily_count": 0},
            "performance": {"user_count": 0, "latency": 0, "shard_count": 1},
            "last_updated": datetime.now().isoformat()
        }
    
    def _process_command_data(self, command_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming command data for storage"""
        # Implementation details for processing command data
        return {
            "command_count": command_data.get("total_commands", 0),
            "daily_commands": command_data.get("daily_count", 0),
            "command_types": command_data.get("command_types", {}),
            "last_update": datetime.now()
        }
    
    def _extract_performance_metrics(self, stats: Dict[str, Any]) -> Dict[str, Any]:
        """Extract performance metrics from stats document"""
        return {
            "user_count": stats.get("user_count", 0),
            "latency": stats.get("latency", 0),
            "shard_count": stats.get("shard_count", 1),
            "memory_usage": stats.get("memory_usage", 0),
            "cpu_usage": stats.get("cpu_usage", 0),
            "guild_count": stats.get("guild_count", 0)
        }
    
    def _get_default_performance_metrics(self) -> Dict[str, Any]:
        """Get default performance metrics"""
        return {
            "user_count": 0,
            "latency": 0,
            "shard_count": 1,
            "memory_usage": 0,
            "cpu_usage": 0,
            "guild_count": 0
        }