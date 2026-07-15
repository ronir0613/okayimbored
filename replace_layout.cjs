const fs = require('fs');
const path = require('path');

const files = [
  'lobby.astro', 'notices.astro', 'lost-and-found.astro', 
  'telephone.astro', 'radio.astro', 'archive.astro', 
  'maintenance.astro', 'basement.astro', 'window.astro', 
  'rooftop.astro', 'tonight.astro'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import
    content = content.replace(
      /import Layout from '\.\.\/layouts\/Layout\.astro';/,
      "import BuildingLayout from '../layouts/BuildingLayout.astro';"
    );
    
    // Replace opening tag
    content = content.replace(/<Layout(.*?)[>]/, '<BuildingLayout$1>');
    
    // Replace closing tag
    content = content.replace(/<\/Layout>/, '</BuildingLayout>');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
