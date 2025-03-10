import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="table"
export default class extends Controller {
	static targets = [];
	// We'll store the dragged element here
	draggedTh = null;

	connect() {
		this.element.addEventListener(
			"dragstart",
			this.handleThDragstart.bind(this),
		);
		this.element.addEventListener("dragover", this.handleThDragover.bind(this));
		this.element.addEventListener("drop", this.handleThDrop.bind(this));
		this.element.addEventListener("dragend", this.handleThDragend.bind(this));
	}

	disconnect() {
		this.element.removeEventListener(
			"dragstart",
			this.handleThDragstart.bind(this),
		);

		this.element.removeEventListener(
			"dragover",
			this.handleThDragover.bind(this),
		);

		this.element.removeEventListener("drop", this.handleThDrop.bind(this));

		this.element.removeEventListener(
			"dragend",
			this.handleThDragend.bind(this),
		);
	}

	handleThDragstart(e) {
		// Only allow dragging if the target is a table header
		if (!e.target.matches("th")) {
			e.preventDefault();
			return;
		}

		console.log("dragstart", e);

		// Save the dragged header element
		this.draggedTh = e.target;

		e.dataTransfer.effectAllowed = "move";

		// Some browsers require data to be set in order for dragging to work
		e.dataTransfer.setData("text/plain", "");
	}
	handleThDragover(e) {
		// Only allow dragging if the target is a table header
		if (!e.target.matches("th")) {
			e.preventDefault();
			return;
		}

		e.preventDefault();

		// Show a move indicator
		e.dataTransfer.dropEffect = "move";
	}

	handleThDrop(e) {
		// Only handle drop if the target is a table header and we have a dragged header
		if (!e.target.matches("th") || !this.draggedTh) {
			e.preventDefault();
			return;
		}
		e.preventDefault();

		const targetTh = e.target;

		// Swap the positions of the dragged header and the target header
		const parent = targetTh.parentElement;
		// Insert the dragged header before the target header
		parent.insertBefore(this.draggedTh, targetTh);

		// Optionally, update the table body columns accordingly if needed.
		// (For example, iterate over each row and swap the corresponding cells.)
	}

	handleThDragend(e) {
		// Only allow dragging if the target is a table header
		if (!e.target.matches("th")) {
			e.preventDefault();
			return;
		}

		// Reset the dragged header
		this.draggedTh = null;
	}
}
