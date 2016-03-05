var subscribes = {};

exports.subscribe = (task,user) => {
    if (!(task in subscribes)) subscribes[task]=[];
    subscribes[task].push(user);
};

exports.getSubscribers = () => {
    return subscribes;
};

exports.send = (task,message) => {
  subscribes.forEach((user)=> {
      user.send(message);
  });
};