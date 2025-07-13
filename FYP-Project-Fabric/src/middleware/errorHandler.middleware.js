import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            data: err.data,
            errors: err.errors,
        });
    }

    // For other errors (unexpected ones), return a generic JSON response
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
    });
};

export { errorHandler };
