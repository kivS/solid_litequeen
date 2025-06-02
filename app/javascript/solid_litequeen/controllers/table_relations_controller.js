import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="table-relations"
export default class extends Controller {
	connect() {
		const table_relations_data = JSON.parse(
			table_relationships.dataset.relations,
		);
		this.tables = table_relations_data.tables;
		this.relations = table_relations_data.relations;

		// graph manages the data structure and state of the diagram
		this.graph = new joint.dia.Graph();

		// paper handles rendering and user interaction
		this.paper = new joint.dia.Paper({
			el: document.getElementById("paper"),
			model: this.graph,
			width: 1000,
			height: 600,
			gridSize: 10,
			drawGrid: true,
			background: {
				color: "var(--color-paper-background)",
			},
			interactive: (cellView) => {
				// If this cell is embedded (a field node),
				// return false so that it doesn't capture pointer events.
				// this way it gets delegated to the parent
				if (cellView.model.parent()) {
					return false;
				}
				return true;
			},
		});

		// so we can render stuff when we open the dialog to avoid render issues with wrong sizes
		this.#observeDialogOpenStatus();
	}

	disconnect() {
		console.log("disconnected...");
	}

        #buildTables() {
                this.tables.forEach((table, index) => {
                        // Initial position - will be adjusted by layout algorithm
                        const position = { x: 100, y: 100 };
                        // Create table node for each table with its fields
                        const tableCells = this.#createTableNode(
                                table.name,
                                table.name,
                                table.fields,
                                position,
                        );
                        this.graph.addCells(tableCells);
                });
        }

	#buildLinks() {
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.relations.forEach((relation) => {
			const sourceId = `${relation.from_table}-${relation.from_field}`;
			const targetId = `${relation.to_table}-${relation.to_field}`;

			const link = new joint.shapes.standard.Link({
				source: { id: sourceId },
				target: { id: targetId },
				attrs: {
					line: {
						stroke: "var(--color-paper-links)",
						strokeWidth: 2,
						targetMarker: {
							type: "path",
							d: "M 10 -5 0 0 10 5 z",
						},
					},
				},
				router: { name: "manhattan" },
				connector: { name: "rounded" },
			});

			this.graph.addCell(link);
		});
	}

	#createTableNode(id, tableName, fields, position) {
		// Calculate height based on number of fields
		const headerHeight = 30;
		const fieldHeight = 25;
		const width = 270;
		const height = headerHeight + fields.length * fieldHeight;

		// Create the main table node
		const tableNode = new joint.shapes.standard.HeaderedRectangle({
			id: id,
			position: position,
			size: { width: width, height: height },
			attrs: {
				body: {
					fill: "#f5f5f5",
					strokeWidth: 2,
					stroke: "#ccc",
				},
				header: {
					fill: "#e0e0e0",
					strokeWidth: 1,
					stroke: "#ccc",
					height: headerHeight,
				},
				headerText: {
					text: tableName,
					fill: "#000",
					fontWeight: "bold",
					fontSize: 16,
				},
			},
		});

		// Create field nodes
                const fieldNodes = fields.map((field, index) => {
                        const label = field.null ? `${field.name} (NULL)` : `${field.name} (NOT NULL)`;
                        const fieldNode = new joint.shapes.standard.Rectangle({
                                id: `${id}-${field.name}`,
                                position: {
                                        x: position.x,
                                        y: position.y + headerHeight + index * fieldHeight,
                                },
                                size: { width: width, height: fieldHeight },
                                attrs: {
                                        body: {
                                                fill: "var(--color-paper-background)",
                                                strokeWidth: 1,
                                                stroke: "#ddd",
                                        },
                                        label: {
                                                text: label,
                                                fill: "var(--color-text)",
                                                fontSize: 14,
                                        },
                                },
				ports: {
					groups: {
						left: {
							position: "left",
							attrs: {
								circle: {
									r: 4,
									magnet: true,
									fill: "transparent",
									stroke: "transparent",
								},
							},
						},
						right: {
							position: "right",
							attrs: {
								circle: {
									r: 4,
									magnet: true,
									fill: "transparent",
									stroke: "transparent",
								},
							},
						},
					},
				},
			});

			// Add ports for connections on left and right sides
			fieldNode.addPort({ group: "left" });
			fieldNode.addPort({ group: "right" });

			// Allow events to bubble to the parent by not stopping delegation.
			fieldNode.set("stopDelegation", false);
			return fieldNode;
		});

		// Embed header and fields in the table node
		// biome-ignore lint/complexity/noForEach: <explanation>
		fieldNodes.forEach((fieldNode) => {
			tableNode.embed(fieldNode);
		});

		return [tableNode, ...fieldNodes];
	}

	#applyLayout() {
		// Create a new directed graph
		const g = new dagre.graphlib.Graph();

		// Set an object for the graph label
		g.setGraph({
			rankdir: "LR",
			nodesep: 80,
			edgesep: 50,
			ranksep: 150,
			marginx: 50,
			marginy: 50,
		});

		// Default to assigning a new object as a label for each new edge.
		g.setDefaultEdgeLabel(() => ({}));

		// Get all the root elements (tables, not fields)
		const elements = this.graph.getElements().filter((el) => !el.parent());

		// Add nodes to the graph
		// biome-ignore lint/complexity/noForEach: <explanation>
		elements.forEach((element) => {
			g.setNode(element.id, {
				width: element.get("size").width,
				height: element.get("size").height,
			});
		});

		// Add edges to the graph
		// biome-ignore lint/complexity/noForEach: <explanation>
		this.graph.getLinks().forEach((link) => {
			const source = this.graph.getCell(link.get("source").id);
			const target = this.graph.getCell(link.get("target").id);

			// Only add edges between parent elements
			if (source && target) {
				const sourceParent = source.parent()
					? this.graph.getCell(source.parent())
					: source;
				const targetParent = target.parent()
					? this.graph.getCell(target.parent())
					: target;

				if (sourceParent.id !== targetParent.id) {
					g.setEdge(sourceParent.id, targetParent.id);
				}
			}
		});

		// Run the layout
		dagre.layout(g);

		// Apply the layout to the JointJS graph
		// biome-ignore lint/complexity/noForEach: <explanation>
		g.nodes().forEach((nodeId) => {
			const element = this.graph.getCell(nodeId);
			if (element) {
				const node = g.node(nodeId);

				// Position the element at the center of the node position
				element.position(node.x - node.width / 2, node.y - node.height / 2);

				// Adjust the position of embedded elements (fields)
				const embeds = element.getEmbeddedCells();
				if (embeds.length > 0) {
					const position = element.position();
					const headerHeight = 30;
					const fieldHeight = 25;

					embeds.forEach((embed, index) => {
						embed.position(
							position.x,
							position.y + headerHeight + index * fieldHeight,
						);
					});
				}
			}
		});

		// Fit the content to the paper
		this.paper.fitToContent({
			padding: 50,
			allowNewOrigin: "any",
		});
	}

	#observeDialogOpenStatus() {
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "open"
				) {
					if (this.element.hasAttribute("open")) {
						// The dialog has been opened – run your code
						setTimeout(() => {
							this.#buildTables();
							this.#buildLinks();
							this.#applyLayout();
						}, 50);
					}
				}
			}
		});

		observer.observe(this.element, { attributes: true });
	}
}
