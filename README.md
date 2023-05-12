## To Run the app

-   npm i
-   npm start

## Branching stragtegy

-   Feature branch from staging
-   Push your feature branch to dev branch (https://app.zluri.dev/) ( Merge feature branch into dev, don't corrupt your feature branch )
-   After your feature is tested on dev by QA
-   Create PR from feature branch to staging (make sure backend is pushed to prod before your feature is pushed to staging)
-   After tested by QA on staging (https://app-stg.zluri.com/)
-   Create staging to eksfargateprod PR (mostly this PR should not require any changes but if required first need to fix it on staging then update staging to prod PR)

## Feature/Fix Process

-   ticket created
-   ticket moved to in-progress
-   Feature build locally
-   Feature tested by developers
-   Feature pushed to dev
-   ticket moved to in-test-dev (assign it to qa)
-   Feature tested by qa, pm's, & others
-   ticket moved to in-review by qa (QA only - cuz the reviewer will know that the ticket is tested by qa) (and assign it back to dev)
-   PR created to staging (here reviewer will validated the ticket status, it has to be "in review" )
-   PR merged to staging
-   Ticket moved to in-test-staging (assign it to qa)
-   On no bugs found on staging ticket is moved to done by QA
-   Create staging to prod PR
-   On prod push update QA for sanity test

## PR

-   Fill in the form only for the staging PR's

## Process of setting up formatter

-   Install Prettier - Code formatter extension on your editor
-   Make Prettier - Code formatter as your default formatter
-   Go to the editor settings and enable format on save option.
-   Prettier is also enabled on pre-commit using husky

Ref:
https://www.digitalocean.com/community/tutorials/code-formatting-with-prettier-in-visual-studio-code
