import zod from 'zod';

export const userDataSchema = zod.object({  // ZOD SCHEMA THAT WILL ALLOW US TO MATCH THE USER DATA'S SCHEMA AND PRODUCE PROPER RESPONSE MESSAGES
    
    username: zod.string({ message: 'Username must be a string'}).min(1, { message: 'Username cannot be empty'}),
    email: zod.string({ message: 'Email must be a string'}).min(1, { message: 'Email cannot be empty'})
        .includes('@', { message: "missing '@'"}).includes('.com', { message: "missing '.com'"}),
    password: zod.string({ message: 'Password must be a string'}).min(8, { message: 'Password must be atleast 8 characters long'}),
    phoneNumber: zod.string({ message: 'Phone number must be a string'}).min(10, { message: 'Phone number must be 10 digit'})
})

export const userDataSchemaOptional = userDataSchema.optional();