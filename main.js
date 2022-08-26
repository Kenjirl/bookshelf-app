const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_SHELF";

function isStorageExist() {
    if (typeof Storage === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener("DOMContentLoaded", function () {
    const submitBookForm = document.getElementById("inputBook");
    submitBookForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
        submitBookForm.reset();
    });

    const searchBookForm = document.getElementById("searchBook");
    searchBookForm.addEventListener("submit", function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const judulBuku = document.getElementById("inputBookTitle").value;
    const penulisBuku = document.getElementById("inputBookAuthor").value;
    const tahunTerbit = document.getElementById("inputBookYear").value;
    const isCompleteCheckBox = document.getElementById(
        "inputBookIsComplete"
    ).checked;

    const bookID = +new Date();
    const bookObject = generateBookObject(
        bookID,
        judulBuku,
        penulisBuku,
        tahunTerbit,
        isCompleteCheckBox
    );
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById(
        "incompleteBookshelfList"
    );
    uncompletedBookList.innerHTML = "";

    const completedBookList = document.getElementById("completeBookshelfList");
    completedBookList.innerHTML = "";

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const judulBuku = document.createElement("h3");
    judulBuku.innerText = bookObject.title;

    const penulisBuku = document.createElement("p");
    penulisBuku.innerText = "Penulis: " + bookObject.author;
    const tahunTerbit = document.createElement("p");
    tahunTerbit.innerText = "Tahun: " + bookObject.year;

    const textContainer = document.createElement("div");
    textContainer.append(judulBuku, penulisBuku, tahunTerbit);

    const container = document.createElement("article");
    container.classList.add("book_item");
    container.append(textContainer);
    container.setAttribute("id", `book-${bookObject.id}`);

    if (bookObject.isComplete) {
        const undoIcon = document.createElement("i");
        undoIcon.classList.add("fa-solid", "fa-rotate");
        const undoButton = document.createElement("button");
        undoButton.classList.add("green");
        undoButton.append(undoIcon);

        undoButton.addEventListener("click", function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can");
        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.append(trashIcon);

        trashButton.addEventListener("click", function () {
            removeBookFromList(bookObject.id);
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("action");
        buttonContainer.append(undoButton, trashButton);

        container.append(buttonContainer);
    } else {
        const checkIcon = document.createElement("i");
        checkIcon.classList.add("fa-solid", "fa-check");
        const checkButton = document.createElement("button");
        checkButton.classList.add("green");
        checkButton.append(checkIcon);

        checkButton.addEventListener("click", function () {
            addBookToCompleted(bookObject.id);
        });

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can");
        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.append(trashIcon);

        trashButton.addEventListener("click", function () {
            removeBookFromList(bookObject.id);
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("action");
        buttonContainer.append(checkButton, trashButton);

        container.append(buttonContainer);
    }

    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    showRemoveAlert();
    setTimeout(hideRemoveAlert, 3000);
    saveData();
}

function showRemoveAlert() {
    const myAlert = document.getElementById("alert");
    myAlert.style.opacity = 1;
}

function hideRemoveAlert() {
    const myAlert = document.getElementById("alert");
    myAlert.style.opacity = 0;
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function changeSubmitBookButtonText() {
    const inputBookButtonText = document
        .getElementById("bookSubmit")
        .querySelector("span");
    const checkBox = document.getElementById("inputBookIsComplete");
    if (checkBox.checked) {
        inputBookButtonText.innerText = "Selesai dibaca";
    } else {
        inputBookButtonText.innerText = "Belum selesai dibaca";
    }
}

function searchBook() {
    let inputJudulBuku = document.getElementById("searchBookTitle").value;
    inputJudulBuku = inputJudulBuku.toLowerCase();

    if (inputJudulBuku == null || inputJudulBuku == "") {
        document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
        for (const bookItem of books) {
            let judulBuku = bookItem.title;
            judulBuku = judulBuku.toLowerCase();
            let elemenBuku = document.getElementById(`book-${bookItem.id}`);
            if (judulBuku.search(inputJudulBuku) + 1) {
                elemenBuku.classList.add("book_item");
                elemenBuku.classList.remove("hidden");
            } else {
                elemenBuku.classList.remove("book_item");
                elemenBuku.classList.add("hidden");
            }
        }
    }
}
