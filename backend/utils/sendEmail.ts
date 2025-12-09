import SendGrid from '@sendgrid/mail'
import { SUPPORT_EMAIL } from '@utils/constants/random'


const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string
const sendgridEnabled = SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')
if (sendgridEnabled) {
  SendGrid.setApiKey(SENDGRID_API_KEY)
}

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!sendgridEnabled) {
    console.warn('SendGrid is disabled: missing or invalid API key.')
    return false
  }
  try {
    await SendGrid.send({ from: SUPPORT_EMAIL, to, subject, html })
  } catch (err) {
    console.error(err)
    return false
  }
  return true
}

export default sendEmail
