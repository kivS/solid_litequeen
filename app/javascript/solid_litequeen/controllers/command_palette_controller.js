/** 
 * 		Command palette
 * 
 * 	   eg:
 * 		
       
* 
* 
* */


import { Controller } from "@hotwired/stimulus";


// Connects to data-controller="command_palette"
export default class extends Controller {

   
    connect() {
        this.isOpen = false;
        this.selectedIndex = 0;
        this.searchItems = [];
        this.filteredItems = [];

        this.modal = document.getElementById('commandPaletteModal');
        this.dialog = document.getElementById('commandPaletteDialog');
        this.input = document.getElementById('commandPaletteInput');
        this.input_timeout = null;
        this.resultsList = document.getElementById('resultsList');
        this.noResults = document.getElementById('noResults');
        this.resultsCount = document.getElementById('resultsCount');
        this.trigger = document.getElementById('commandPaletteTrigger');

        this.initializeSearchItems();
        this.bindEvents();
        this.updateResults();
    }

    async initializeSearchItems() {
        this.searchItems = [];
        const request = await fetch(this.element.dataset.command_palette_data_path);
        const data = await request.json();
        this.searchItems = [...data];
    }

    bindEvents() {
        // Trigger button click
        this.trigger.addEventListener('click', () => this.open());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Input change
        this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (!this.dialog.contains(e.target)) {
                this.close();
            }
        });
    }

    handleKeyDown(e) {
        // Global shortcut
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if(this.isOpen) return this.close();
            
            this.open();
            return;
        }

        if (!this.isOpen) return;

        switch (e.key) {
            case 'Escape':
                this.close();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = this.selectedIndex < this.filteredItems.length - 1
                    ? this.selectedIndex + 1
                    : 0;
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = this.selectedIndex > 0
                    ? this.selectedIndex - 1
                    : this.filteredItems.length - 1;
                this.updateSelection();
                break;
            case 'Enter':
                if (this.filteredItems[this.selectedIndex]) {
                    this.selectItem(this.filteredItems[this.selectedIndex]);
                }
                break;
        }
    }

    handleSearch(query) {
        clearTimeout(this.input_timeout);

        if (!query) {
            this.filteredItems = [...this.searchItems];
            this.selectedIndex = 0;
            this.updateResults();

        } else {
            
            this.input_timeout = setTimeout(() => {       
                this.filteredItems = this.searchItems.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    (item.database_name && item.database_name.toLowerCase().includes(query.toLowerCase())) ||
                    (item.database_file_name && item.database_file_name.toLowerCase().includes(query.toLowerCase()))               
                );

                this.selectedIndex = 0;
                this.updateResults();
            }, 200);
        }

      
    }

    updateResults() {
        this.resultsCount.textContent = `${this.filteredItems.length} results`;

        if (this.filteredItems.length === 0) {
            this.noResults.classList.remove('hidden');
            this.resultsList.innerHTML = '';
            return;
        }

        this.noResults.classList.add('hidden');

        this.resultsList.innerHTML = this.filteredItems.slice(0, 25).map((item, index) => {
            const isSelected = index === this.selectedIndex;
            
            const icon = item.type === 'database'
                ? `<img  src="${this.element.dataset.database_svg_img_path}" class="size-4 filter-blue opacity-80" />`
                : `<img src="${this.element.dataset.table_svg_img_path}" class="size-4 filter-lime opacity-80" />`;

            const badge = item.type === 'table'
                ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-content text-neutral">${item.rowCount?.toLocaleString()} rows</span>`
                : '';

            const database = item.database_file_name
                ? `<div class="text-xs text-base-content/60 truncate">in ${item.database_file_name}</div>`
                : '';

            return `
                <div ${isSelected ? 'data-selected': ''} data-index="${index}" class="data-selected:outline-2 outline-[var(--color-primary)] data-selected:bg-[var(--color-base-100)]  flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors">
                    ${icon}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-medium truncate">${item.name}</span>
                            ${badge}
                        </div>
                        ${database}
                    </div>
                    <svg class="w-4 h-4 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            `;
        }).join('');

        // Add click handlers to result items
        this.resultsList.querySelectorAll('[data-index]').forEach((element, index) => {
            element.addEventListener('click', () => this.selectItem(this.filteredItems[index]));
            element.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });
        });
    }

    updateSelection() {
        this.resultsList.querySelectorAll('[data-index]').forEach((element, index) => {
            if (index === this.selectedIndex) {
                element.setAttribute('data-selected', true);
                element.scrollIntoView({ block: 'nearest' });
            } else {
                element.removeAttribute('data-selected');
            }
        });
    }

    selectItem(item) {
        this.close(true);
        Turbo.visit(item.path);

    }

    open() {
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        // this.dialog.classList.add('dialog-enter');
        this.input.focus();
        this.input.value = '';
        this.handleSearch('');
    }

    close(quiet=false) {
        this.isOpen = false;
        // this.dialog.classList.remove('dialog-enter');

        if(quiet){
            this.modal.classList.add('hidden');
            this.selectedIndex = 0;
            return
        }

        // this.dialog.classList.add('dialog-exit');
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
            // this.dialog.classList.remove('dialog-exit');
            this.selectedIndex = 0;
        }, 100);
    }

  
}

