

npx nx g @nx/react-native:lib libs/react-native --importPath=@siku-zangu/react-native \ 
--directory=libs/react-native --linter=eslint  --unitTestRunner=jest

npx nx g @nx/react:lib libs/react --importPath=@siku-zangu/react --linter=eslint \
--unitTestRunner=jest --bundler=none --style=css

npx nx g @nx/js:lib libs/knex --bundler=none --importPath=@siku-zangu/knex --linter=eslint \
--unitTestRunner=jest

