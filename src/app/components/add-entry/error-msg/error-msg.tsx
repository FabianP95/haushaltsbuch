import { useEffect } from 'react';
import styles from './error-msg.module.scss';

type Message = {
    text: string;
    onExpire: () => void;
}; 


/**
 * Shows an error text and calls `onExpire` after 2 seconds so the parent can remove it.
 * @param props - The message `text` and the `onExpire` callback
 * @returns The error message element
 */
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