const VOWELS = new Set(["a", "i", "u", "e", "o"]);
const DIGRAPHS = ["ng", "ny", "sy", "kh"];
const DIPHTHONGS = ["ai", "au", "oi"];

function isVowel(ch) {
  return VOWELS.has(ch);
}
function startsWithDigraph(s) {
  return DIGRAPHS.some((d) => s.startsWith(d));
}

function syllabifyWord(word) {
  const lower = word.toLowerCase();
  const chars = [...word]; // simpan huruf asli
  const charsLower = [...lower]; // untuk logika
  const out = [];
  let i = 0;

  while (i < chars.length) {
    // onset
    let onset = "";
    while (i < chars.length && !isVowel(charsLower[i])) {
      onset += chars[i++]; // pakai huruf asli
    }

    // nucleus
    let nucleus = "";
    if (i < chars.length && isVowel(charsLower[i])) {
      if (i + 1 < chars.length) {
        const two = charsLower[i] + charsLower[i + 1];
        if (DIPHTHONGS.includes(two)) {
          nucleus = chars[i] + chars[i + 1]; // huruf asli
          i += 2;
        } else {
          nucleus = chars[i++];
        }
      } else {
        nucleus = chars[i++];
      }
    }

    if (nucleus === "") {
      if (out.length) out[out.length - 1] += onset;
      else out.push(onset);
      break;
    }

    // cluster konsonan
    const consStart = i;
    while (i < chars.length && !isVowel(charsLower[i])) i++;
    const cluster = chars.slice(consStart, i).join("");
    const clusterLower = charsLower.slice(consStart, i).join("");

    if (i === chars.length) {
      out.push(onset + nucleus + cluster);
      break;
    }

    if (cluster.length === 0) {
      out.push(onset + nucleus);
    } else if (cluster.length === 1) {
      out.push(onset + nucleus);
      i = consStart;
    } else {
      if (startsWithDigraph(clusterLower)) {
        out.push(onset + nucleus);
        i = consStart;
      } else {
        out.push(onset + nucleus + cluster[0]);
        i = consStart + 1;
      }
    }
  }
  return out;
}

export function splitWordsBySyllable(sentence) {
  const words = sentence.split(" ");

  const result = words.map((word) => {
    return syllabifyWord(word);
  });

  return result;
}

export function splitWords(sentence) {
  const words = sentence.split(" ");

  return words;
}
