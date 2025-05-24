import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="dialog"
export default class extends Controller {
	connect() {
		// this.element === dialog
		this.element.addEventListener(
			"click",
			this.handleClickOusideDialog.bind(this),
		);
        }

        close() {
                this.element?.close();
        }

	disconnect() {
		this.element.removeEventListener(
			"click",
			this.handleClickOusideDialog.bind(this),
		);

		this.element?.close();
	}

	/**
	 * Handles mouse events for the search dialog.
	 * @param {MouseEvent} event - The mouse event triggered by user interaction.
	 */
	handleClickOusideDialog(event) {
		const rect = this.element.getBoundingClientRect();
		const isInDialog =
			rect.top <= event.clientY &&
			event.clientY <= rect.top + rect.height &&
			rect.left <= event.clientX &&
			event.clientX <= rect.left + rect.width;
		if (!isInDialog) {
			this.element?.close();
		}
	}
}
