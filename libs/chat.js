var subscribes = {};

exports.subscribe = (task,user) => {
    if (!(task in subscribes)) subscribes[task]=[];
    subscribes[task].push(user);
    user.on('close', ()=> {
        Object.keys(subscribes).forEach((task)=> {
            var index = subscribes[task].indexOf(user);
            if (index!==-1) subscribes[task].splice(index,1);
        });
    });
};

exports.getSubscribers = () => {
    return subscribes;
};

exports.send = (task,message) => {
  subscribes[task].forEach((user)=> {
      user.send(message);
  });
    subscribes[task] = [];
};