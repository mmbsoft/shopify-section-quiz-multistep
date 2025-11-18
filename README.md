# Shopify Quiz Section

Demo: https://dev-mmbsoft.myshopify.com/

Hasło: `!bth`

Fork: https://github.com/mmbsoft/dawn/tree/quiz-section-multistep


## Description:
Multi-step quiz section in the latest Dawn theme. The quiz collects tags from selected
answers and generates a See results button that links to the filtered collection.


## Question block
Each block include:
- A question title (text)
- Two answers (radio buttons). Each answer has a label and a tag.
- Label for the Next button.

## Editor settings
- Heading font size with separate values for mobile and desktop
- Question text size with separate values for mobile and desktop
- Top and bottom padding with separate values for mobile and desktop
- Label for the results button

## Web Components
-  `<shopify-quiz>` which controls the flow, state, and validation
-  `<shopify-question>` which renders a single step with radio answers and a Next button

## Additional features
1. Inline Results via AJAX
2. Instead of only redirecting, enhance the quiz so that after the last step it also loads the product
grid inline under a Results headline.
3. Section Rendering API with the tag path: (for example
`/collections/all/tag1+tag2+tag3?sections=<product_grid_section_handle>`)
4. Loading state while fetching.
6. Friendly empty state message if no products are returned.



## Rrunning and Development 
1. Copy all files to the proper destinations inside your Shopify Theme

2. If you want to edit `JS`, `CSS` you need to install PNPM dependencies and build production files using `Gulp.js`

3. To run build first You need install dependencies using PNPM

```sh
pnpm install
```
4. Run fresh JS and CSS build using Gulp default task:
```sh
gulp
```