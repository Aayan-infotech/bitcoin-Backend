const Poll =require("../../models/AlphabetDetails/CdetailModel")
const createPoll = async (req, res) => {
  try {
    const { question, hashtags, options } = req.body;

    const poll = await Poll.create({
      question,
      hashtags,
      options: options.map((text) => ({ text })),
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const votePoll = async (req, res) => {
  const { pollId } = req.params;
  const { selectedOption } = req.body;

  try {
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Check if user already voted
    const alreadyVoted = poll.votes.find((v) =>
      v.user.toString() === req.user.id
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: "User already voted" });
    }

    poll.options[selectedOption].voteCount++;
    poll.votes.push({ user: req.user.id, selectedOption });

    await poll.save();

    res.status(200).json({ success: true, message: "Vote recorded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId).populate("createdBy", "name");
    if (!poll) return res.status(404).json({ message: "Poll not found" });

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
    const optionsWithPercent = poll.options.map((opt) => ({
      ...opt._doc,
      percentage: totalVotes ? ((opt.voteCount / totalVotes) * 100).toFixed(1) : 0,
    }));

    res.status(200).json({
      question: poll.question,
      hashtags: poll.hashtags,
      createdBy: poll.createdBy,
      totalVotes,
      options: optionsWithPercent,
      // commentsCount: totalVotes, 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



module.exports={createPoll,votePoll,getPoll}