from .main import main_bp
from .api import api_bp
from .auth import auth_bp
from .admin import admin_bp

def register_routes(app, db, cache, limiter):
    """Register all route blueprints"""
    
    # Register blueprints with dependencies
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    # Make dependencies available to routes
    app.db = db
    app.cache = cache
    app.limiter = limiter