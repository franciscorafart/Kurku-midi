1. Instal http-server and run index.html with Node instead of directly in the browser. => This makes it easier to load the model documents. Navigate to the root directory of the project and run `$ http-server`


# TODO:
1. Create global config object that stores the effects configuration for 1 signal chain
2. Modify setAudio so that it responds to this global config object and maps the corresponding body part in the config
3. Write generic effect value setter
4. Implement sends
5. Migrate to Typescript React app
6. Implement multiple audio sources / multiple poses