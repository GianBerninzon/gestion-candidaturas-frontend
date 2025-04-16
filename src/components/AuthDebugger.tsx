import useAuthStore from "@/store/authStore"
import React, { useEffect, useState } from "react";

// Interface para las autoridades
interface Authority {
    authority: string;
}

//Interface para los detalles del token
interface TokenDetails {
    header: any;
    payload: {
        authorities?: Authority[] | string[];
        sub?: string;
        exp?: number;
        [key: string]: any;
    };
    signature: string;
}

const AuthDebugger: React.FC = () => {
    const { token, user, isAuthenticated } = useAuthStore();
    const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
    
    useEffect(() => {
        if(token){
            try{
                // Decodificar el token JWT (sin verificar la firma)
                const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
                const [headerB64, payloadB64, signature] = tokenValue.split('.');

                // Decodifigcar base64url a JSON
                const decodeBase64 = (str: string) => {
                    // Convertir base64url a base64 estandar
                    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                    const padding = '='.repeat((4 - base64.length % 4) % 4);

                    // Decodificar
                    try {
                        const jsonStr = atob(base64 + padding);
                        return JSON.parse(jsonStr);   
                    } catch (e) {
                        console.error('Error parsing JSON from token:', e);
                        return {};
                    }
                };

                const header = decodeBase64(headerB64);
                const payload = decodeBase64(payloadB64);

                setTokenDetails({ header, payload, signature });
            }catch(error){
                console.error('Error decodificando token:', error);
            }
        }
    }, [token]);

    // No renderizar nada en produccion
    if(import.meta.env.PROD){
        return null;
    }

    return (
        <div id="auth-debugger-container" style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            backgroundColor: '#f8f9fa',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '10px',
            maxWidth: '400px',
            fontSize: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            maxHeight: '50vh',
            overflow: 'auto'
        }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #fff', paddingBottom: '5px' }}>
                Auth Debugger
            </h3>

            <div>
                <p><strong>Auth State:</strong> {isAuthenticated ? '✅ autenticado' : '❌ no autenticado'}</p>
                <p><strong>Usuario:</strong> {user?.username || 'No definido'}</p>
                <p><strong>Rol:</strong> {user?.role || 'No definido'}</p>

                {token ? (
                    <>
                    <p><strong>Token presente:</strong>✅</p>
                    <p><strong>Token en formato Bearer:</strong> {token.startsWith('Bearer ') ? '✅' : '❌'}</p>

                    {tokenDetails && (
                        <>
                            <div>
                                <strong>Header:</strong>
                                <pre style={{ background: '#f0f0f0', padding: '5px', borderRadius: '3px', overflow:'auto' }}>
                                    {JSON.stringify(tokenDetails.header, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <strong>Payload:</strong>
                                <pre style={{ background: '#f0f0f0', padding: '5px', borderRadius: '3px', overflow: 'auto' }}>
                                    {JSON.stringify(tokenDetails.payload, null, 2)}
                                </pre>

                                {/* Mostrar especificamente las authorities */}
                                {tokenDetails.payload.authorities && (
                                    <div style={{ marginTop: '5px' }}>
                                        <strong>Authorities:</strong>
                                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                            {Array.isArray(tokenDetails.payload.authorities) &&
                                                tokenDetails.payload.authorities.map((auth: any, index: number) => (
                                                <li key={index}>
                                                    {typeof auth === 'string'
                                                        ? auth
                                                        : auth.authority
                                                            ? auth.authority
                                                            : JSON.stringify(auth)
                                                    }
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    </>
                ) : (
                    <p><strong>Token:</strong> ❌ No presente</p>
                )}
            </div>

            <button
                onClick={() => {
                    const debugElement = document.getElementById('auth-debugger-container');
                    if(debugElement) debugElement.style.display = 'none';
                }}
                style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#e9e9e9',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                }}
                
            >
                Cerrar
            </button>
        </div>
    );
};

export default AuthDebugger;
