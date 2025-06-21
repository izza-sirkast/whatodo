import Joi from 'joi';

function validator(schema: Joi.ObjectSchema) {
  return (data: any) : { error?: Joi.ValidationError; value?: any } => {
    return schema.validate(data, {
      abortEarly: false,
    });
  } 
}

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required()
})

export const validateRegister = validator(registerSchema);

const postTodoSchema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    content: Joi.string().min(1).max(500).required()
})

export const validatePostTodo = validator(postTodoSchema);