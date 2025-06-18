import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    """Setup logging configuration"""
    
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(os.path.dirname(app.instance_path), 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
    
    # Configure logging level
    log_level = app.config.get('LOG_LEVEL', 'INFO')
    app.logger.setLevel(getattr(logging, log_level))
    
    # File handler for production
    if not app.debug:
        file_handler = RotatingFileHandler(
            os.path.join(logs_dir, 'dashboard.log'),
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
    
    # Console handler for development
    if app.debug:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        app.logger.addHandler(console_handler)
    
    app.logger.info('Dashboard startup')