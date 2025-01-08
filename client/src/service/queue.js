class roomQueue {
  constructor() {
    // console.log(this.queue);
  }

  addUser(data) {
    if (this.queue.length < 5) {
      localStorage.setItem("queue-data", [
        { name: data.name, gender: data.gender },
      ]);
    }
  }
}

export default new roomQueue();
