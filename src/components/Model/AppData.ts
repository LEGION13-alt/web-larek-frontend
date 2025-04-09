import { Model } from '../base/Model';
import { IBasket, IProductItem, IOrder, IOrderForm } from '../../types';
import { EventEmitter } from '../base/events';

export class ProductItem extends Model<IProductItem> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	index: number;
}

export type CatalogChangeEvent = {
	catalog: ProductItem[];
};

export interface IAppData {
	catalog: ProductItem[];
	items: string[];
	total: number;
	preview: string | null;
	order: IOrder | null;
}

export class AppData extends Model<IAppData> {
	catalog: ProductItem[] = [];
	preview: ProductItem | null = null;
	basket: IBasket = {
		items: [],
		total: 0,
	};
	order: IOrderForm = {
		email: '',
		phone: '',
		address: '',
		payment: 'online',
	};

	formErrors: Partial<Record<keyof IOrderForm, string>> = {};

	constructor(data: Partial<{}>, events: EventEmitter) {
		super(data, events);
	}

	//карточки
	setCatalog(items: ProductItem[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.events.emit('catalog:changed', { catalog: this.catalog });
	}

	setPreview(item: ProductItem) {
		this.preview = item;
		this.events.emit('preview:change', item);
	}

	//корзина

	isInBasket(item: ProductItem) {
		return this.basket.items.includes(item.id);
	}

	addToBasket(item: ProductItem) {
		this.basket.items.push(item.id);
		this.basket.total = this.getTotal() + item.price;
		this.events.emit('basket:changed', this.basket.items);
	}

	deleteFromBasket(item: ProductItem) {
		const index = this.basket.items.indexOf(item.id);
		if (index >= 0) {
			this.basket.items.splice(index, 1);
			this.basket.total = this.getTotal() - item.price;
			this.events.emit('basket:changed', this.basket.items);
		}
	}

	clearBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.clearOrder();
	}

	getBasketVolume(): number {
		return this.basket.items.length;
	}

	getTotal() {
		return this.basket.total;
	}

	//заказ

	setOrderField(field: keyof IOrderForm, value: string) {
		if (field === 'payment') {
			this.order.payment = value;
		}
		if (field === 'address') {
			this.order.address = value;
		}
		this.validateOrder();
	}

	setContactsField(field: keyof IOrderForm, value: string) {
		if (field === 'phone') {
			this.order.phone = value;
		}
		if (field === 'email') {
			this.order.email = value;
		}
		this.validateContacts();
	}

	//валидация

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}

		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('contactsFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	getOrder(): IOrder {
		return {
			...this.order,
			items: this.basket.items,
			total: this.basket.total,
		};
	}

	clearOrder() {
		this.order = {
			email: '',
			phone: '',
			address: '',
			payment: 'online',
		};
	}
}
