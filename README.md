# book-maker

1. install tailwind & princexml
2. find a way to have hmr in public folder

### run the following in new terminal parallely

1. generate tailwind - `bun tailwind:watch`
2. run the book on web - `bun dev` (optional)
3. generate a pdf - `bun nodemon`

### run the following to generate pdf after some changes to .md files

run `bun start` to generate css using tailwind (`bun prestart`), convert `chapter#/index.md` files to `index.html`, and finally generate a pdf using `princexml`.

> note: you can ignore `public/` folder entirely as it gets generated.

### delete annotation after running through princexml

https://www.sejda.com/delete-pdf-annotations
