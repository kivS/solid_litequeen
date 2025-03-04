import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="tet"
export default class extends Controller {
	connect() {
		console.log("hello potato");
	}
}
