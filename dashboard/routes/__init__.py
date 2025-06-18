from .main import main_bp

def register_routes(app, db, cache, limiter):
    """Register all route blueprints"""
    
    # Register blueprints with dependencies
    app.register_blueprint(main_bp)
    
    # Make dependencies available to routes
    app.db = db
    app.cache = cache
    app.limiter = limiter