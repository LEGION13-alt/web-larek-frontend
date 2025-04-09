import { Form } from '../common/Form';
import { IOrderForm, PaymentMethod } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

//адрес и оплата
export class OrderForm extends Form<IOrderForm> {
	protected _buttonOnline: HTMLButtonElement;
	protected _buttonCash: HTMLButtonElement;
	protected _address: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._buttonOnline = ensureElement<HTMLButtonElement>(
			'.button_alt[name=card]',
			this.container
		);
		this._buttonCash = ensureElement<HTMLButtonElement>(
			'.button_alt[name=cash]',
			this.container
		);
		this._address = ensureElement<HTMLInputElement>(
			'.form__input[name=address]',
			this.container
		);

		this._buttonOnline.addEventListener('click', () => {
			this.payment = 'online';
			this.onInputChange('payment', 'online');
		});
		this._buttonCash.addEventListener('click', () => {
			this.payment = 'cash';
			this.onInputChange('payment', 'cash');
		});
	}

	set payment(value: PaymentMethod) {
		this.toggleClass(
			this._buttonOnline,
			'button_alt-active',
			value === 'online'
		);
		this.toggleClass(this._buttonCash, 'button_alt-active', value === 'cash');
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

		this._email = ensureElement<HTMLInputElement>(
			'.form__input[name=email]',
			this.container
		);
		this._phone = ensureElement<HTMLInputElement>(
			'.form__input[name=phone]',
			this.container
		);
	}

	set email(value: string) {
		this._email.value = value;
	}

	set phone(value: string) {
		this._phone.value = value;
	}
}
