import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

interface ISuccessActions {
	onClick: () => void;
}

interface ISuccess {
	total: number;
}

export class Success extends Component<ISuccess> {
	protected _close: HTMLButtonElement;
	protected _total: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._close = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);
		this._total = ensureElement<HTMLButtonElement>(
			'.order-success__description',
			this.container
		);

		if (actions?.onClick) {
			this._close.addEventListener('click', actions.onClick);
		}
	}

	set total(total: number) {
		this.setText(this._total, `Списано ${total} синапсов`);
	}
}
