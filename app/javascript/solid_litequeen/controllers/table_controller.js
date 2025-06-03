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

		this.#load_datetime_local_title();
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
				// Get all rows in the table body
				const tbody = this.element.querySelector("tbody");
				const rows = Array.from(tbody.querySelectorAll("tr"));

				// Reorder cells in each row to match new column order
                                for (const row of rows) {
                                        const cells = Array.from(row.querySelectorAll("td"));
                                        const reorderedCells = columnOrder
                                                .map((colName) => {
                                                        // Find cell with matching data-column attribute
                                                        const match = cells.find(
                                                                (cell) =>
                                                                        cell.dataset.column === colName,
                                                        );
                                                        if (!match) {
                                                                console.warn(
                                                                        `Column ${colName} not found in row`,
                                                                        row,
                                                                );
                                                        }
                                                        return match;
                                                })
                                                .filter(Boolean);

                                        // Clear row and append cells in new order
                                        row.innerHTML = "";
                                        for (const cell of reorderedCells) {
                                                row.appendChild(cell);
                                        }
                                }
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

	/**
	 *
	 * @param {MouseEvent} e
	 * @returns
	 */
	load_foreign_key_data(e) {
		const foreign_key_data_dialog = document.querySelector(
			"dialog#foreign-key-data",
		);

		const foreign_key_data_frame = document.querySelector(
			"#foreign-key-data-frame",
		);

		const fk_data_dialog_button = e.currentTarget;
		const fk_target_table = fk_data_dialog_button.dataset.fk_target_table;
		const fk_target_field = fk_data_dialog_button.dataset.fk_target_field;
		const fk_target_field_value =
			fk_data_dialog_button.dataset.fk_target_field_value;

		// Extract just the path without any query parameters
		const clean_database_table_path = new URL(this.element.dataset.database_table_path, window.location.origin).pathname;

		const new_frame_src = `${clean_database_table_path}/foreign-key-data/${fk_target_table}/${fk_target_field}/${fk_target_field_value}`;

		// if the src didn't change let's just show what we have
		if (foreign_key_data_frame.src) {
			const frame_src_current_path = new URL(foreign_key_data_frame.src)
				?.pathname;

			if (new_frame_src === frame_src_current_path) {
				foreign_key_data_dialog.showModal();
				return;
			}
		}

		foreign_key_data_frame.src = new_frame_src;
		foreign_key_data_dialog.showModal();
	}

	#load_datetime_local_title() {
		setTimeout(() => {
			const datetime_items = this.element.querySelectorAll(
				'td[data-data_type="datetime"]',
			);

			for (const item of datetime_items) {
				const column_item_datetime = item.querySelector(
					"span[data-column_item]",
				)?.textContent;

				if (column_item_datetime) {
					try {
						// Parse the UTC datetime string
						const utcDate = new Date(`${column_item_datetime.trim()}Z`);

						// Format to local datetime using Intl.DateTimeFormat
						const localDatetime = new Intl.DateTimeFormat("default", {
							year: "numeric",
							month: "short",
							day: "numeric",
							hour: "numeric",
							minute: "numeric",
							second: "numeric",
						}).format(utcDate);

						item.setAttribute("title", `${localDatetime} local time.`);
					} catch (error) {
						console.error("Error converting datetime:", error);
					}
				}
			}
		}, 2000);
	}
}
