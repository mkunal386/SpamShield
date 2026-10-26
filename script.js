
const model = window.SPAMSHIELD_MODEL;

const messageInput = document.getElementById("message");
const result = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

function tokenize(text) {
  return text.toLowerCase().match(/\b[a-z]+\b/g) || [];
}

function predict(text) {
  if (!model) {
    throw new Error("Model not loaded. Check model-data.js.");
  }

  const vocabulary = new Set(model.vocabulary);
  const words = tokenize(text).filter(word =>
    vocabulary.has(word)
  );

  if (words.length === 0) {
    return null;
  }

  const labels = ["spam", "not spam"];
  const totalMessages =
    model.spam.messages + model["not spam"].messages;

  let bestLabel = "";
  let bestScore = -Infinity;

  for (const label of labels) {
    const category = model[label];

    let score = Math.log(
      category.messages / totalMessages
    );

    for (const word of words) {
      const count = category.words[word] || 0;

      score += Math.log(
        (count + 1) /
        (category.totalWords + vocabulary.size)
      );
    }

    if (score > bestScore) {
      bestScore = score;
      bestLabel = label;
    }
  }

  return bestLabel;
}

analyzeBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();

  result.className = "result";

  if (!text) {
    result.textContent = "Please enter a message first.";
    return;
  }

  try {
    const prediction = predict(text);

    if (!prediction) {
      result.textContent =
        "Unable to classify this message. Try another message.";
      return;
    }

    if (prediction === "spam") {
      result.classList.add("spam");
      result.textContent = "🚫 SPAM MESSAGE";
    } else {
      result.classList.add("safe");
      result.textContent = "✅ NOT SPAM";
    }
  } catch (error) {
    result.textContent = error.message;
    console.error(error);
  }
});

clearBtn.addEventListener("click", () => {
  messageInput.value = "";
  result.className = "result";
  result.textContent = "Your result will appear here.";
});
