import React from 'react'
import './Header.css'
export default function Header({ HeaderName }) {
    return (
        <div>
            <h1 className="h1">{HeaderName}</h1>
        </div>
    )
}
