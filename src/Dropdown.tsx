import {useState, useRef, useEffect, ReactNode} from 'react';

interface DropdownProps {
    title?: String
    children: ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
}


function Dropdown ({ title, children, onOpen, onClose }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsOpen((prev) => {
            const nextState = !prev;
            if (nextState && onOpen) onOpen();
            if (!nextState && onClose) onClose();
            return nextState;
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // @ts-ignore
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (isOpen) {
                    setIsOpen(false);
                    if (onClose) onClose();
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button onClick={toggleDropdown} style={{ padding: '10px' }}>
                {title}
            </button>

            {isOpen && (
                <div>
                    <br/>
                    {children}
                </div>
            )}
        </div>
    );
}

export default Dropdown;
