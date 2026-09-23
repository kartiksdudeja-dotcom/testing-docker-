import { getPayload } from 'payload'
import config from 'cms/src/payload.config.ts'

const payload = await getPayload({ config })

const user = await payload.create({
  collection: 'users',
  data: {
    name: 'Kartik',
    email: 'YOUR_EMAIL@gmail.com',
    password: 'KartikAdmin123!',
  },
})

console.log('User created:', user.email)

process.exit(0)