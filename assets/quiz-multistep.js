if (!customElements.get('shopify-question')) {
  customElements.define(
    'shopify-question',
    class extends HTMLElement {
      connectedCallback() {
        const step = Number(this.dataset.step);
        const question = this.dataset.question;
        const nextLabel = this.dataset.nextLabel;
        const data = JSON.parse(this.dataset.answers);
        this.innerHTML = `
          <details class="quiz__step collapsible-content ${
            step === 1 ? '' : 'locked'
          } scroll-trigger animate--fade-in" ${step === 1 ? 'open' : ''}>
            <summary class="quiz__summary"><span class="quiz__step-number">${step}</span> <span class="quiz__summary-text">${question}</span></summary>
            <div class="quiz__body collapsible-content__inner">
              <div class="quiz__options">
                ${data
                  .map(
                    (option) => `
                    <button type="button" class="quiz__option card card--standard" data-tag="${option.tag}">
                      <div class="card__content">
                        <span class="card__heading h5">${option.label}</span>
                      </div>
                    </button>
                  `
                  )
                  .join('')}
              </div>
              <p class="quiz__error hidden">Please select an answer to continue.</p>
              <div class="quiz__actions">
                <button type="button" class="button button--secondary quiz__next" data-step="${step}">${nextLabel}</button>
              </div>
            </div>
          </details>
        `;

        this.details = this.querySelector('.quiz__step');
        this.summary = this.querySelector('.quiz__summary');
        this.error = this.querySelector('.quiz__error');
        this.nextBtn = this.querySelector('.quiz__next');
        this.options = this.querySelectorAll('.quiz__option');
        this.selected = null;

        this.summary.addEventListener('click', (e) => {
          if (this.details.classList.contains('locked')) {
            e.preventDefault();
            e.stopPropagation();
          } else {
            this.dispatchEvent(new CustomEvent('summary-toggled', { bubbles: true }));
          }
        });

        this.options.forEach((opt) => {
          opt.addEventListener('click', () => {
            this.options.forEach((o) => o.classList.remove('is-selected'));

            opt.classList.add('is-selected');
            this.selected = opt.dataset.tag;
          });
        });

        this.nextBtn.addEventListener('click', () => {
          if (!this.selected) {
            this.error.classList.remove('hidden');
            return;
          }

          this.error.classList.add('hidden');

          const quizParent = this.closest('shopify-quiz');
          const totalSteps = quizParent ? quizParent.querySelectorAll('shopify-question').length : step;
          const isFinal = step === totalSteps;

          this.dispatchEvent(
            new CustomEvent('step-complete', {
              bubbles: true,
              detail: { step, tag: this.selected, final: isFinal },
            })
          );
        });
      }
    }
  );
}

if (!customElements.get('shopify-quiz')) {
  customElements.define(
    'shopify-quiz',
    class extends HTMLElement {
      constructor() {
        super();

        this.tags = [];
        this.currentStep = 1;
      }
      connectedCallback() {
        this.questions = Array.from(this.querySelectorAll('shopify-question'));
        this.resultsLabel = this.dataset.resultsLabel || 'See results';
        this.progress = document.querySelector('.quiz__progress-fill');

        const progressWrapper = document.querySelector('.quiz__progress-wrapper');

        if (progressWrapper && !progressWrapper.querySelector('.quiz__progress-label')) {
          const label = document.createElement('div');

          label.className = 'quiz__progress-label';
          progressWrapper.insertBefore(label, progressWrapper.firstChild);
        }

        this.setupInitialSteps();
        this.ensureFinalButtonLabel();
        this.updateProgress();

        this.addEventListener('summary-toggled', (e) => {
          const details = e.target.closest('.quiz__step');

          this.questions.forEach((question) => {
            const d = question.querySelector('.quiz__step');
            if (d !== details) d.removeAttribute('open');
          });
        });

        this.addEventListener('step-complete', (e) => {
          const { step, tag, final } = e.detail;

          this.tags[step - 1] = tag;

          if (final) {
            this.showResults(this.tags);
          } else {
            this.activateStep(step + 1);
          }
        });
      }

      setupInitialSteps() {
        this.questions.forEach((question, i) => {
          const details = question.querySelector('.quiz__step');

          if (i === 0) {
            details.classList.remove('locked');
            details.setAttribute('open', '');
          } else {
            details.classList.add('locked');
            details.removeAttribute('open');
          }
        });
      }

      ensureFinalButtonLabel() {
        if (!this.questions.length) return;

        const lastQ = this.questions[this.questions.length - 1];
        const lastBtn = lastQ.querySelector('.quiz__next');

        if (lastBtn) {
          lastBtn.textContent = this.resultsLabel;
          lastBtn.classList.remove('button--secondary');
          lastBtn.classList.add('button');
        }
      }

      activateStep(step) {
        this.currentStep = step;

        this.questions.forEach((question, i) => {
          const details = question.querySelector('.quiz__step');

          if (i + 1 === step) {
            details.classList.remove('locked');
            details.setAttribute('open', '');

            details.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            details.removeAttribute('open');

            if (i + 1 > step) details.classList.add('locked');
            else details.classList.remove('locked');
          }
        });

        this.updateProgress();

        if (step === this.questions.length) {
          this.ensureFinalButtonLabel();
        }
      }

      updateProgress() {
        if (!this.progress) return;

        const percent = (this.currentStep / this.questions.length) * 100;
        this.progress.style.width = `${percent}%`;

        const label = document.querySelector('.quiz__progress-label');
        if (label) label.textContent = `Step ${this.currentStep} / ${this.questions.length}`;
      }

      async showResults(tags) {
        const resultsWrapper = document.getElementById('quiz-results');
        const resultsContent = document.getElementById('quiz-results-content');

        resultsWrapper.classList.remove('hidden');
        resultsContent.innerHTML = `<div class="quiz-loader"></div>`;

        const sectionHandle = 'main-collection-product-grid';

        const params = new URLSearchParams();
        params.append('sections', sectionHandle);
        tags.forEach((tag) => params.append('filter.p.m.custom.tags', tag));

        const url = `/collections/all?${params.toString()}`;

        try {
          const response = await fetch(url, { credentials: 'same-origin' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();
          let html = data[sectionHandle];

          if (html && html.trim().length > 0) {
            html = html
              .replace(/<form[^>]*id="SortByForm"[\s\S]*?<\/form>/gi, '')
              .replace(/<select[^>]*id="SortBy"[\s\S]*?<\/select>/gi, '')
              .replace(/<facet-filters-form[\s\S]*?<\/facet-filters-form>/gi, '')
              .replace(/<div[^>]*id="ProductCount"[\s\S]*?<\/div>/gi, '')
              .replace(/<h1[^>]*class="collection-title"[\s\S]*?<\/h1>/gi, '')
              .replace(/<div[^>]*class="collection-description"[\s\S]*?<\/div>/gi, '');

            resultsContent.innerHTML = html;
          } else {
            resultsContent.innerHTML = `<p>Brak produktów spełniających wybrane kryteria.</p>`;
          }
        } catch (error) {
          resultsContent.innerHTML = `<p>Wystąpił problem podczas wczytywania wyników. Spróbuj ponownie później.</p>`;
          console.error(error);
        }
      }
    }
  );
}
