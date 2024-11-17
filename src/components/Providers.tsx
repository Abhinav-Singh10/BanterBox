'use client'

// Reason for creation of this component is cause we need to render context as a client component, this react hook will provide some state to the entire application
import { FC, ReactNode } from 'react'
// this Toaster will allow use to create Toasters anywhere in our app
import { Toaster } from 'react-hot-toast'

interface ProvidersProps {
  children:ReactNode
}

// Here our whole app will be passed as children
const Providers: FC<ProvidersProps> = ({children}) => {
  return <>
  <Toaster position='top-center' reverseOrder={false}/>
  {children}
</>
}

export default Providers