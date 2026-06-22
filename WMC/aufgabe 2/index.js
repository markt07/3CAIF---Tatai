// Stufe 1: Einfaches Promise
function holeBrief(inhalt) {
  return new Promise(resolve => {
    setTimeout(() => resolve(inhalt), 1000);
  });
}

// Stufe 2: Promise Chaining
function stempelBrief(brief) {
  return new Promise(resolve => {
    resolve(brief + " [Gestempelt]");
  });
}

function versendeBrief(brief) {
  return new Promise(resolve => {
    resolve(brief + " -> Versendet!");
  });
}

holeBrief("Hallo Welt")
  .then(brief => stempelBrief(brief))
  .then(brief => versendeBrief(brief))
  .then(brief => console.log(brief));
