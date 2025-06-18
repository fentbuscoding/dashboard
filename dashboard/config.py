import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    
    # Flask Core
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    FLASK_ENV = os.environ.get('FLASK_ENV', 'production')
    
    # Database
    MONGO_URI = os.environ.get('MONGO_URI')
    MONGO_CONNECT_TIMEOUT = 5000
    MONGO_SERVER_SELECTION_TIMEOUT = 5000
    
    # Discord Configuration
    DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
    DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')
    DISCORD_BOT_TOKEN = os.environ.get('DISCORD_BOT_TOKEN')
    DISCORD_BOT_OWNER_ID = os.environ.get('DISCORD_BOT_OWNER_ID')
    
    # Security
    WTF_CSRF_ENABLED = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    
    # Caching
    CACHE_TYPE = 'redis' if os.environ.get('REDIS_URL') else 'simple'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'dashboard.log')
    
    # Features
    FEATURES = {
        'MONGODB_ENABLED': bool(MONGO_URI),
        'DISCORD_OAUTH_ENABLED': bool(DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET),
        'STATS_ENABLED': True,
        'ADMIN_PANEL_ENABLED': bool(DISCORD_BOT_OWNER_ID)
    }
    
    # Application Info
    VERSION = '2.0.0'
    APP_NAME = 'BronxBot Dashboard'
    
    @classmethod
    def validate_config(cls):
        """Validate critical configuration"""
        missing = []
        if not cls.SECRET_KEY or cls.SECRET_KEY == 'dev-secret-key-change-in-production':
            missing.append('SECRET_KEY')
        if not cls.MONGO_URI:
            missing.append('MONGO_URI')
        if not cls.DISCORD_CLIENT_ID:
            missing.append('DISCORD_CLIENT_ID')
        if not cls.DISCORD_CLIENT_SECRET:
            missing.append('DISCORD_CLIENT_SECRET')
        
        return missing

class DevelopmentConfig(Config):
    """Development configuration"""
    FLASK_ENV = 'development'
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False  # Disable CSRF for development
    CACHE_TYPE = 'simple'

class ProductionConfig(Config):
    """Production configuration"""
    FLASK_ENV = 'production'
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    
class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    WTF_CSRF_ENABLED = False
    CACHE_TYPE = 'null'
    
# Configuration mapping
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': ProductionConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'production')
    return config_map.get(env, config_map['default'])
