import { useEffect } from 'react';
import styles from './error-msg.module.scss';

type Message = {
    text: string;
    onExpire: () => void;
}; 


export function ErrorMessage({ text, onExpire }: Message) {
    useEffect(() => {
        const timer = setTimeout(onExpire, 2000);
        return () => clearTimeout(timer);
    }, [text, onExpire]);

    return (
        <span className={`${styles.errorText} ${styles.errorTextVisible}`}>
            {text}
        </span>
    );
}