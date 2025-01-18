interface ModalProps {
    title: string;
    message: string;
    buttonText: string;
    onClose: () => void;
    onAction?: () => void;
    secondaryButtonText?: string;
    onSecondaryAction?: () => void;
}

export const createModal = ({
                                title,
                                message,
                                buttonText,
                                onClose,
                                onAction,
                                secondaryButtonText,
                                onSecondaryAction,
                            }: ModalProps): HTMLElement => {
    const modal = document.createElement('div');
    modal.className = 'modal-wrapper dimmed';

    modal.innerHTML = `
        <div class="modal">
            <h2 class="modal-title">${title}</h2>
            <p class="modal-message">${message}</p>
            <div class="modal-actions">
                <button id="modal-action-btn" class="btn-primary">${buttonText}</button>
                ${
        secondaryButtonText
            ? `<button id="modal-secondary-btn" class="btn-secondary">${secondaryButtonText}</button>`
            : ''
    }
            </div>
        </div>
    `;

    modal.querySelector('#modal-action-btn')?.addEventListener('click', () => {
        onAction?.();
        onClose();
    });

    if (secondaryButtonText && onSecondaryAction) {
        modal.querySelector('#modal-secondary-btn')?.addEventListener('click', () => {
            onSecondaryAction();
            onClose();
        });
    }

    return modal;
};

export const showModal = (props: ModalProps): void => {
    const modal = createModal(props);
    document.body.appendChild(modal);

    const closeModal = () => {
        if (document.body.contains(modal)) {
            try {
                document.body.removeChild(modal);
            } catch (error) {
                console.error('모달 제거 중 오류 발생:', error);
            }
        }
    };

    const originalOnClose = props.onClose;
    props.onClose = () => {
        closeModal();
        originalOnClose?.();
    };

    modal.querySelector('#modal-action-btn')?.addEventListener('click', () => {
        props.onClose();
    });
};
