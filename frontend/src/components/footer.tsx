import React from 'react'
import { Container } from './container'

const Footer = () => {
    return (
        <div className="w-full bg-gray-100">
            <Container className="flex items-center mb-2 bg-white justify-center py-4 rounded-md border border-dark mx-auto mt-2">
                <div>Made With ❤️ By <span className="font-bold">Karim Magdy</span></div>
            </Container>
        </div>
    )
}

export default Footer