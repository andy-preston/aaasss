// It's OK to poke multiple times in a JavaScript file
const stuff = [1, 2, 3, 4];
label("firstPoke");
poke(...stuff);
label("secondPoke");
poke(...stuff);
