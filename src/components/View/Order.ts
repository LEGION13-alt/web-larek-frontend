import {Form} from '../common/Form';
import {IOrderForm} from "../../types";
import {IEvents} from "../base/events";
import {ensureAllElements,ensureElement} from "../../utils/utils";

//адрес и оплата
export class OrderForm extends Form<IOrderForm> {
	protected _buttons: HTMLButtonElement[];
	protected _address: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
			super(container, events);

			this._address = ensureElement<HTMLInputElement>('.form__input[name=address]',this.container);

			this._buttons = ensureAllElements<HTMLButtonElement>('.button_alt',	this.container);
			this._buttons.forEach((button) => {
				button.addEventListener('click', () => {
					this._buttons.forEach(element => {
					element.classList.toggle('button_alt-active', element === button);
				});
				events.emit('payment:changed', button);
			});
			});
	}

	set address(value: string) {
		this._address.value = value;
	}
}

// телефон и емейл
export class ContactsForm extends Form<IOrderForm> {
	
	protected _email: HTMLInputElement;
	protected _phone: HTMLInputElement;
	
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

		this._email = ensureElement<HTMLInputElement>('.form__input[name=email]', this.container);
		this._phone = ensureElement<HTMLInputElement>('.form__input[name=phone]', this.container);
    }

	set email(value: string) {
		this._email.value = value;
	}

	set phone(value: string) {
		this._phone.value = value;
	}
}