export interface IProductItem {//товар
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}


export interface IBasket {//корзина в карточке
	items: string[];
	total: number;
}

export interface IOrderLot {//данные заказа
	items: string[];
	total: number;
	payment: string;
	email: string;
	phone: string;
	address: string;
}

export interface IOrderResult {//результат заказа для отправки
	id: string;
	total: number;
}

export interface IOrderForm {//данные формы заказа
	payment?: string;
	address?: string;
	phone?: string;
	email?: string;
	}

export interface IOrder extends IOrderForm {
	total?: number;
	items: string[];
	}
