import { ProductItem } from '../Model/AppData';
import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export type CardData = ProductItem & {
	button?: string;
};

export class Card extends Component<CardData> {
	protected _title: HTMLElement;
	protected _description?: HTMLElement;
	protected _category: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;

    categories: Record<string, string> = {
        'другое': 'card__category_other',
        'софт-скил': 'card__category_soft',
        'дополнительное': 'card__category_additional',
        'кнопка': 'card__category_button',
        'хард-скил': 'card__category_hard',
    }

	constructor(protected container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._description = container.querySelector('.card__text');
		this._category = container.querySelector('.card__category');
		this._image = container.querySelector('.card__image');
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set button(value: string) {
		this.setText(this._button, value);
	}

	//прайс
	set price(value: string) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
		if (this._button) {
			this._button.disabled = !value;
		}
	}

	get price(): string {
		return this._price.textContent || '';
	}

	//описание
	set description(value: string) {
		this.setText(this._description, value);
	}

	//категория
	set category(value: string) {
		this.setText(this._category, value);
		this._category.classList.add(`${this.categories[value]}`);
	}

	get category(): string {
		return this._category.textContent || '';
	}
}

//карточки в корзине

export class CardInBasket extends Component<CardData> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _index: HTMLElement;
	protected _deleteCardButton: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);

		this._index = container.querySelector(`.basket__item-index`);
		this._deleteCardButton = container.querySelector(`.basket__item-delete`);

		if (actions?.onClick) {
			this._deleteCardButton.addEventListener('click', actions.onClick);
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number) {
		this.setText(this._price, `${value} синапсов`);
	}
	set index(value: number) {
		if (this._index) {
			this._index.textContent = String(value);
		}
	}
}
