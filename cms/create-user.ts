import { getPayload } from 'payload'
import 'dotenv/config'
import config from './src/payload.config'

const payload = await getPayload({ config })

const email = 'kartikadmin@test.com'
const password = 'KartikAdmin123!'

try {
  const user = await payload.create({
    collection: 'users',
    data: {
      name: 'Kartik Admin',
      email,
      password,
    },
  })

  console.log('USER CREATED')
  console.log('Email:', user.email)
  console.log('Password:', password)
} catch (error) {
  console.error('ERROR:', error)
}

process.exit(0)