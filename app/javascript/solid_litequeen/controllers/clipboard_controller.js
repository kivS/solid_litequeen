/** 
 * 		Clipboard copy function
 * 
 * 	   eg:
 * 		
  	<div data-controller="clipboard" class="relative">	  			
  		<button title="Copy" data-action="clipboard#copy" class="absolute top-2 right-2 hover:cursor-pointer">
			<%= image_tag "solid_litequeen/icons/copy-clipboard.svg", class: "in-data-copied:hidden size-5 dark:filter-white" %>
			<span class="hidden in-data-copied:block">Copied!</span>
		</button>

		<p data-clipboard-target="source"> Potato </p>
	</div>
* 
* 
* */ 


import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="clipboard"
export default class extends Controller {
	// data-clipboard-target="source"
	static targets = ["source"];

	// data-action="clipboard#copy"
	copy() {
		if (this.sourceTarget) {
			const text = this.sourceTarget.value || this.sourceTarget.textContent;
			navigator.clipboard.writeText(text);

			const button = this.element.querySelector("button");

			button.setAttribute("data-copied", true)

			setTimeout(() => {
				button.removeAttribute("data-copied")
			}, 2000);
		}
	}
}
