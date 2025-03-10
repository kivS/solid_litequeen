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
		this.element.addEventListener(
			"dragenter",
			this.handleThDragenter.bind(this),
		);
		this.element.addEventListener(
			"dragleave",
			this.handleThDragleave.bind(this),
		);
	}

	disconnect() {
		this.element.removeEventListener("dragstart", this.handleThDragstart);

		this.element.removeEventListener("dragover", this.handleThDragover);

		this.element.removeEventListener("drop", this.handleThDrop);

		this.element.removeEventListener("dragend", this.handleThDragend);
		this.element.removeEventListener("dragenter", this.handleThDragenter);
		this.element.removeEventListener("dragleave", this.handleThDragleave);
	}

	handleThDragstart(e) {
		// Only allow dragging if the target is a table header
		if (!e.target.matches("th")) {
			e.preventDefault();
			return;
		}

		// Save the dragged header element
		this.draggedTh = e.target;

		this.draggedTh.setAttribute("data-is-dragging", true);

		e.dataTransfer.effectAllowed = "move";

		// Some browsers require data to be set in order for dragging to work
		e.dataTransfer.setData("text/plain", "");
	}

	handleThDragover(e) {
		const targetTh = e.target.closest("th");
		// Only allow dragging if the target is a table header
		if (!targetTh) {
			e.preventDefault();
			return;
		}

		e.preventDefault();

		// Show a move indicator
		e.dataTransfer.dropEffect = "move";

		this.draggedTh.removeAttribute("data-is-dragging");
	}

	handleThDrop(e) {
		const targetTh = e.target.closest("th");

		// Only handle drop if the target is a table header and we have a dragged header
		if (!targetTh || !this.draggedTh) {
			e.preventDefault();
			return;
		}
		e.preventDefault();

		// Swap the positions of the dragged header and the target header
		const parent = targetTh.parentElement;
		// Insert the dragged header before the target header
		parent.insertBefore(this.draggedTh, targetTh);

		const headers = Array.from(parent.querySelectorAll("th"));
		const columnOrder = headers.map((th) => {
			// You might want to use data attributes to store column identifiers
			return th.dataset.columnName;
		});

		const token = document.querySelector('meta[name="csrf-token"]').content;

		fetch(this.element.dataset.setTableOrderPath, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": token,
			},
			body: JSON.stringify({ columnOrder }),
		}).then((result) => {
			if (result.ok) {
				Turbo.visit(window.location.href);
			}
		});

		targetTh.removeAttribute("data-column-order-about-to-be-swapped");
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

	handleThDragenter(e) {
		const targetTh = e.target.closest("th");
		// If there's no valid target or the target is the dragged header itself, do nothing
		if (!targetTh || targetTh === this.draggedTh) {
			return;
		}

		e.preventDefault();

		targetTh.setAttribute("data-column-order-about-to-be-swapped", true);
	}

	handleThDragleave(e) {
		const targetTh = e.target.closest("th");
		if (!targetTh) {
			return;
		}
		e.preventDefault();

		targetTh.removeAttribute("data-column-order-about-to-be-swapped");
	}
}
