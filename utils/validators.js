import Joi from 'joi';

export const employeeSchemaValidation = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Full name is required',
            'string.min': 'Name should be at least 3 characters'
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address'
        }),

    contact: Joi.string()
        .pattern(/^[0-9+]+$/)
        .min(10)
        .required()
        .messages({
            'string.pattern.base': 'Contact must contain only numbers or +',
            'string.min': 'Contact must be at least 10 digits'
        }),

    dob: Joi.date()
        .less('now')
        .required()
        .messages({
            'date.less': 'Date of birth cannot be in the future'
        }),

    // age: Joi.number()
    //     .integer()
    //     .min(18)
    //     .max(100)
    //     .required(),

    department: Joi.string()
        .required(),
        
    // Status is usually handled by the system, but we include it if passed
    status: Joi.string()
        .valid('Active', 'Archived')
        .default('Active')
});

// Add this export to your utils/validators.js
export const broadcastValidation = Joi.object({
    subject: Joi.string().min(5).required().messages({
        'string.empty': 'Subject cannot be empty',
        'string.min': 'Subject should be at least 5 characters'
    }),
    message: Joi.string().min(10).required().messages({
        'string.empty': 'Message body is required',
        'string.min': 'Message should be at least 10 characters'
    }),
    targetDepartment: Joi.string().optional() // Allow targeting all or one dept
});