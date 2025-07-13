/**
 * 
 *  Stimulus to put an object in the "orbit" or another object using floating-ui.
 *  We define a "planet" and its "moon" that'll orbit around it.
 *  eg:
*     
    <div data-controller="orbit">
      <button data-orbit-target="planet" popovertarget="menu-popover" style="anchor-name:--anchor-menu">🌐</button>

      <ul popover id="menu-popover"  data-orbit-target="moon" style="position-anchor:--anchor-menu">
          <li>one</li>
          <li>two</li>
      </ul>
    </div> 
 * 
 **/ 

import { Controller } from "@hotwired/stimulus"

const { computePosition, flip, shift, offset, autoUpdate } = window.FloatingUIDOM;

// data-controller="orbit"
export default class extends Controller {
  // data-orbit-target="planet"
  // data-orbit-target="moon"
  static targets = ["planet", "moon"]
  
  connect() {
    this.setupOrbit();
    
  }
  
  setupOrbit() {
    this.cleanup = autoUpdate(
      this.planetTarget,
      this.moonTarget,
      () => this.updatePosition()
    );
  }
  
  updatePosition() {
    computePosition(this.planetTarget, this.moonTarget, {
      placement: 'bottom',
      strategy: 'fixed',  // wow this was what was missing!
      middleware: [
        offset(6),
        flip(),
        shift({ padding: 5 })
      ],
    }).then(({x, y}) => {
      Object.assign(this.moonTarget.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }
  

  disconnect() {
    if (this.cleanup) {
      this.cleanup();
    }
    
  }
}
