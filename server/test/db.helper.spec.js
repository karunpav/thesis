const expect = require('chai').expect;
const dbUtils = require('../../db/lib/utils.js');
const knex = require('knex')(require('../../knexfile'));
const dbhelper = require('../../db/helpers.js');

describe('User', () => {
  beforeEach(function (done) {
    knex.schema.hasTable('knex_migrations_lock')
      .then((exists) => {
        if (exists) {
          return knex('knex_migrations_lock').where('is_locked', '1').del();
        }
        return;
      })
      .then(() => {
        dbUtils.rollbackMigrate(done);
      });
  });

  // Resets database back to original settings
  afterEach(function (done) {
    knex.schema.hasTable('knex_migrations_lock')
      .then((exists) => {
        if (exists) {
          return knex('knex_migrations_lock').where('is_locked', '1').del();
        }
        return;
      })
      .then(() => {
        dbUtils.rollback(done);
      });
  });

  describe('createUser()', () => {
    it('Should exist', () => {
      expect(dbhelper.createUser).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.createUser).to.be.a('function');
    });
    it('Should create a user if it does not exist in the database', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah'
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser');
          expect(user['profile_photo']).to.equal('http://www.mypic.com');
          expect(user['oauth_id']).to.equal('12345');
          expect(user['email']).to.equal('baseball@aol.com');
          expect(user['lastboard_id']).to.equal(undefined);
          done();
        })
        .error((err) => done(err));
    });
    it('Should reject if passed an existing github_handle', (done) => {
      var profileInfo = {
        github_handle: 'stevepkuo',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com'
      };
      dbhelper.createUser(profileInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('delUserById()', () => {
    it('Should exist', () => {
      expect(dbhelper.delUserById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.delUserById).to.be.a('function');
    });
    it('Should delete a user in the database', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user.github_handle).to.equal('dummyuser');
          return dbhelper.delUserById(user.id);
        })
        .then(delresult => {
          expect(delresult).to.equal('success');
          return dbhelper.getUserByEmailNoError('baseball@aol.com');
        })
        .then(result => {
          expect(result).to.equal('nonexisting user');
          done();
        })
        .error((err) => done(err));
    });
    it('Should reject if delete a user that does not exist in the database', (done) => {
      dbhelper.delUserById(200)
        .then(delresult => {
          expect(delresult).to.equal('delete error');
          return dbhelper.getUserByEmailNoError('baseball@aol.com');
        })
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('getUserById()', () => {
    it('Should exist', () => {
      expect(dbhelper.getUserById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getUserById).to.be.a('function');
    });
    it('Should return user if it exists in database', (done) => {
      dbhelper.getUserById(1)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('stevepkuo');
          expect(user['profile_photo']).to.equal('https://avatars0.githubusercontent.com/u/14355395?v=4');
          expect(user['oauth_id']).to.equal('14355395');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a user that does not exist', (done) => {
      dbhelper.getUserById(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('getUserByApiKey()', () => {
    it('Should exist', () => {
      expect(dbhelper.getUserByApiKey).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getUserByApiKey).to.be.a('function');
    });
    it('Should return user if inputted API key exists', (done) => {
      dbhelper.getUserByApiKey('fish')
        .then((user) => {
          expect(user).to.exist;
          expect(user['id']).to.equal(1);
          expect(user['github_handle']).to.equal('stevepkuo');
          expect(user['api_key']).to.equal('fish');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if inputted API Key does not exist', (done) => {
      dbhelper.getUserByApiKey('otter123')
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('getUserByIdUnhidden()', () => {
    it('Should exist', () => {
      expect(dbhelper.getUserByIdUnhidden).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getUserByIdUnhidden).to.be.a('function');
    });
    it('Should return user if it exists in database', (done) => {
      dbhelper.getUserByIdUnhidden(1)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('stevepkuo');
          expect(user['profile_photo']).to.equal('https://avatars0.githubusercontent.com/u/14355395?v=4');
          expect(user['oauth_id']).to.equal('14355395');
          expect(user['api_key']).to.equal('fish');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a user that does not exist', (done) => {
      dbhelper.getUserByIdUnhidden(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getUserByEmailNoError()', () => {
    it('Should exist', () => {
      expect(dbhelper.getUserByEmailNoError).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getUserByEmailNoError).to.be.a('function');
    });
    it('Should return user if it exists in database', (done) => {
      dbhelper.getUserByEmailNoError('blah@aol.com')
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('stevepkuo');
          expect(user['profile_photo']).to.equal('https://avatars0.githubusercontent.com/u/14355395?v=4');
          expect(user['oauth_id']).to.equal('14355395');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should not reject if passed a user that does not exist', (done) => {
      dbhelper.getUserByEmailNoError('doesnotexist@aol.com')
        .then((user) => {
          expect(user).to.exist;
          expect(user).to.equal('nonexisting user');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
  });
  describe('updateUserById()', () => {
    it('Should exist', () => {
      expect(dbhelper.updateUserById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.updateUserById).to.be.a('function');
    });
    it('Should update a user if it exists in the database', (done) => {
      var profileInfo = {
        github_handle: 'stevepkuo',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com'
      };
      dbhelper.updateUserById(1, profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('stevepkuo');
          expect(user['profile_photo']).to.equal('http://www.mypic.com');
          expect(user['oauth_id']).to.equal('12345');
          expect(user['email']).to.equal('baseball@aol.com');
          expect(user['lastboard_id']).to.equal(null);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a user that does not exist', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com'
      };
      dbhelper.updateUserById(10, profileInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

});

describe('User-Board Membership', () => {
  beforeEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollbackMigrate(done);
      });
  });

  afterEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollback(done);
      });
  });

  describe('addUserToBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.addUserToBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.addUserToBoard).to.be.a('function');
    });
    it('Should add membership and return board linked to user', (done) => {
      dbhelper.addUserToBoard(1, 2)
        .then((confirmation) => {
          return dbhelper.getBoardsByUser(1);
        })
        .then((boards) => {
          expect(boards).to.exist;
          expect(boards.length).to.equal(2);
          expect(boards[0]['board_name']).to.equal('testboard');
          expect(boards[1]['board_name']).to.equal('testboard2');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a user that does not exist', (done) => {
      dbhelper.addUserToBoard(9, 1)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should reject if passed a board that does not exist', (done) => {
      dbhelper.addUserToBoard(1, 9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should reject if passed a user and board that are already linked', (done) => {
      dbhelper.addUserToBoard(1, 2)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getBoardsByUser()', () => {
    it('Should exist', () => {
      expect(dbhelper.getBoardsByUser).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getBoardsByUser).to.be.a('function');
    });
    it('Should return an array of boards linked to user', (done) => {
      dbhelper.getBoardsByUser(1)
        .then((boards) => {
          expect(boards).to.exist;
          expect(Array.isArray(boards)).to.be.true;
          expect(boards.length).to.equal(1);
          expect(boards[0]['board_name']).to.equal('testboard');
          expect(boards[0]['repo_name']).to.equal('thesis');
          expect(boards[0]['repo_url']).to.equal('https://github.com/Benevolent-Roosters/thesis');
          expect(boards[0]['owner_id']).to.equal(1);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should return an empty array if user does not belong to any boards', (done) => {
      dbhelper.getBoardsByUser(2)
        .then((boards) => {
          expect(boards).to.exist;
          expect(Array.isArray(boards)).to.be.true;
          expect(boards.length).to.equal(0);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a user that does not exist', (done) => {
      dbhelper.getBoardsByUser(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getUsersByBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.getUsersByBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getUsersByBoard).to.be.a('function');
    });
    it('Should return an array of users linked to board', (done) => {
      dbhelper.getUsersByBoard(1)
        .then((users) => {
          expect(users).to.exist;
          expect(Array.isArray(users)).to.be.true;
          expect(users.length).to.equal(1);
          expect(users[0]['github_handle']).to.equal('stevepkuo');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a board that does not exist', (done) => {
      dbhelper.getUsersByBoard(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

});

describe('Board', () => {
  beforeEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollbackMigrate(done);
      });
  });

  afterEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollback(done);
      });
  });

  describe('createBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.createBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.createBoard).to.be.a('function');
    });
    it('Should create a board if it does not exist in the database', (done) => {
      var boardInfo = {
        board_name: 'dummyboard',
        repo_name: 'dummyrepo',
        repo_url: 'http://www.com',
        owner_id: 1,
      };
      dbhelper.createBoard(boardInfo)
        .then((board) => {
          expect(board).to.exist;
          expect(board['board_name']).to.equal('dummyboard');
          expect(board['repo_name']).to.equal('dummyrepo');
          expect(board['repo_url']).to.equal('http://www.com');
          expect(board['owner_id']).to.equal(1);
          done();
        })
        .error((err) => done(err));
    });
    it('Should reject if passed an existing board_name', (done) => {
      var boardInfo = {
        board_name: 'dummyboard',
        repo_name: 'dummyrepo',
        repo_url: 'http://www.com',
        owner_id: 1,
      };
      dbhelper.createBoard(boardInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getBoardById()', () => {
    it('Should exist', () => {
      expect(dbhelper.getBoardById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getBoardById).to.be.a('function');
    });
    it('Should return board if it exists in database', (done) => {
      dbhelper.getBoardById(1)
        .then((board) => {
          expect(board).to.exist;
          expect(board['board_name']).to.equal('testboard');
          expect(board['repo_name']).to.equal('thesis');
          expect(board['repo_url']).to.equal('https://github.com/Benevolent-Roosters/thesis');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a board that does not exist', (done) => {
      dbhelper.getBoardById(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('updateBoardById()', () => {
    it('Should exist', () => {
      expect(dbhelper.updateBoardById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.updateBoardById).to.be.a('function');
    });
    it('Should update a board if it exists in the database', (done) => {
      var boardInfo = {
        board_name: 'testboard',
        repo_name: 'brendan'
      };
      dbhelper.updateBoardById(1, boardInfo)
        .then((board) => {
          expect(board).to.exist;
          expect(board['board_name']).to.equal('testboard');
          expect(board['repo_name']).to.equal('brendan');
          expect(board['repo_url']).to.equal('https://github.com/Benevolent-Roosters/thesis');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed in board that does not exist', (done) => {
      var boardInfo = {
        board_name: 'newboard',
        repo_name: 'board',
        repo_url: 'http://www.myboard.com'
      };
      dbhelper.updateBoardById(9, boardInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

});

describe('getBoardByRepoUrl()', () => {
  it('Should exist', () => {
    expect(dbhelper.getBoardByRepoUrl).to.exist;
  });
  it('Should be a function', () => {
    expect(dbhelper.getBoardByRepoUrl).to.be.a('function');
  });
  it('Should retrieve a board using its Github repo-url if it exists in the database', (done) => {
    dbhelper.getBoardByRepoUrl('https://github.com/Benevolent-Roosters/thesis')
      .then(board => {
        expect(board).to.exist;
        expect(board.id).to.equal(1);
        done();
      })
      .catch(err => {
        expect('thrown error').to.equal('thrown error');
        done();
      })
      .error(err => {
        expect('thrown error').to.equal('thrown error');
        done();
      });
  });
  it('Should reject if the passed in board repo-url does not exist', (done) => {
    dbhelper.getBoardByRepoUrl('https://github.com/foobar')
      .then((result) => {
        expect('not thrown').to.equal('thrown error');
        done();
      })
      .catch((err) => {
        expect('thrown error').to.equal('thrown error');
        done();
      })
      .error((err) => {
        expect('thrown error').to.equal('thrown error');
        done();
      });
  });
});

describe('Panel', () => {
  beforeEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollbackMigrate(done);
      });
  });

  afterEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollback(done);
      });
  });

  describe('createPanel()', () => {
    it('Should exist', () => {
      expect(dbhelper.createPanel).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.createPanel).to.be.a('function');
    });
    it('Should create a panel if it does not exist in the database', (done) => {
      var panelInfo = {
        name: 'dummypanel',
        board_id: 1,
      };
      dbhelper.createPanel(panelInfo)
        .then((panel) => {
          expect(panel).to.exist;
          expect(panel['name']).to.equal('dummypanel');
          expect(panel['board_id']).to.equal(1);
          done();
        })
        .error((err) => done(err));
    });
    it('Should reject if passed in existing panel name', (done) => {
      var panelInfo = {
        name: 'dummypanel',
        board_id: 1,
      };
      dbhelper.createPanel(panelInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should reject if passed in board does not exist', (done) => {
      var panelInfo = {
        name: 'dummypanel9',
        board_id: 9,
      };
      dbhelper.createPanel(panelInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getPanelById()', () => {
    it('Should exist', () => {
      expect(dbhelper.getPanelById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getPanelById).to.be.a('function');
    });
    it('Should return panel if it exists in database', (done) => {
      dbhelper.getPanelById(1)
        .then((panel) => {
          expect(panel).to.exist;
          expect(panel['name']).to.equal('testpanel');
          expect(panel['board_id']).to.equal(1);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a panel that does not exist', (done) => {
      dbhelper.getPanelById(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getPanelsByBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.getPanelsByBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getPanelsByBoard).to.be.a('function');
    });
    it('Should return an array of panels assigned to board', (done) => {
      dbhelper.getPanelsByBoard(1)
        .then((panels) => {
          expect(panels).to.exist;
          expect(Array.isArray(panels)).to.be.true;
          expect(panels.length).to.equal(1);
          expect(panels[0]['name']).to.equal('testpanel');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should sort panels by due date', (done) => {
      dbhelper.getPanelsByBoard(3)
        .then((panels) => {
          expect(panels).to.exist;
          expect(panels[0]['name']).to.equal('testpanel3A');
          expect(panels[1]['name']).to.equal('testpanel3B');
          expect(panels[2]['name']).to.equal('testpanel3C');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should return an empty array if no panels have been created in board', (done) => {
      dbhelper.getPanelsByBoard(2)
        .then((panels) => {
          expect(panels).to.exist;
          expect(Array.isArray(panels)).to.be.true;
          expect(panels.length).to.equal(0);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a board that does not exist', (done) => {
      dbhelper.getPanelsByBoard(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('updatePanelById()', () => {
    it('Should exist', () => {
      expect(dbhelper.updatePanelById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.updatePanelById).to.be.a('function');
    });
    it('Should update a panel if it exists in the database', (done) => {
      let panelInfo = {
        due_date: '2017-09-20'
      };
      dbhelper.updatePanelById(1, panelInfo)
        .then((panel) => {
          expect(panel).to.exist;
          expect(panel['name']).to.equal('testpanel');
          expect(panel['due_date']).to.equal('2017-09-20');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed in a panel that does not exist', (done) => {
      var panelInfo = {
        name: 'nonexistentpanel',
      };
      dbhelper.updatePanelById(9, panelInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

});

describe('Ticket', () => {
  beforeEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollbackMigrate(done);
      });
  });

  afterEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollback(done);
      });
  });

  describe('createTicket()', () => {
    it('Should exist', () => {
      expect(dbhelper.createTicket).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.createTicket).to.be.a('function');
    });
    it('Should create a ticket if it does not exist in the database', (done) => {
      var ticketInfo = {
        title: 'dummyticket',
        status: 'in progress',
        priority: 1,
        creator_id: 1,
        assignee_handle: 'stevepkuo2',
        panel_id: 1,
        board_id: 1
      };
      dbhelper.createTicket(ticketInfo)
        .then((ticket) => {
          expect(ticket).to.exist;
          expect(ticket['title']).to.equal('dummyticket');
          expect(ticket['status']).to.equal('in progress');
          expect(ticket['priority']).to.equal(1);
          expect(ticket['created_at']).to.be.a('date');
          expect(ticket['creator_id']).to.equal(1);
          expect(ticket['assignee_handle']).to.equal('stevepkuo2');
          expect(ticket['panel_id']).to.equal(1);
          expect(ticket['board_id']).to.equal(1);
          done();
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a title that already exists', (done) => {
      var ticketInfo = {
        name: 'dummyticket',
        board_id: 1,
      };
      dbhelper.createTicket(ticketInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should reject if passed a ticket that does not exist', (done) => {
      var ticketInfo = {
        title: 'dummyticket9',
        status: 'in progress',
        priority: 1,
        created_at: knex.fn.now(),
        creator_id: 1,
        assignee_handle: 'stevepkuo2',
        panel_id: 9,
        board_id: 1
      };
      dbhelper.createTicket(ticketInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getTicketById()', () => {
    it('Should exist', () => {
      expect(dbhelper.getTicketById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getTicketById).to.be.a('function');
    });
    it('Should return ticket if it exists in database', (done) => {
      dbhelper.getTicketById(1)
        .then((ticket) => {
          expect(ticket).to.exist;
          expect(ticket['title']).to.equal('testticket');
          expect(ticket['status']).to.equal('in progress');
          expect(ticket['type']).to.equal('feature');
          expect(ticket['creator_id']).to.equal(1);
          expect(ticket['assignee_handle']).to.equal('stevepkuo');
          expect(ticket['panel_id']).to.equal(1);
          expect(ticket['board_id']).to.equal(1);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a ticket that does not exist', (done) => {
      dbhelper.getTicketById(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('getTicketsByUserHandleAndBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.getTicketsByUserHandleAndBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getTicketsByUserHandleAndBoard).to.be.a('function');
    });
    it('Should return tickets of a user if they exist in database', (done) => {
      dbhelper.getTicketsByUserHandleAndBoard('stevepkuo', 1)
        .then((tickets) => {
          expect(tickets).to.exist;
          expect(tickets[0]['title']).to.equal('testticket');
          expect(tickets[0]['status']).to.equal('in progress');
          expect(tickets[0]['priority']).to.equal(2);
          expect(tickets[0]['type']).to.equal('feature');
          expect(tickets[0]['creator_id']).to.equal(1);
          expect(tickets[0]['assignee_handle']).to.equal('stevepkuo');
          expect(tickets[0]['panel_id']).to.equal(1);
          expect(tickets[0]['board_id']).to.equal(1);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error(err => done(err));
    });
    it('Should reject if user and board id do not match or have tickets', (done) => {
      dbhelper.getTicketsByUserHandleAndBoard('bobby123', 5)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('updateTicketById()', () => {
    it('Should exist', () => {
      expect(dbhelper.updateTicketById).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.updateTicketById).to.be.a('function');
    });
    it('Should update a ticket if it exists in the database', (done) => {
      let ticketInfo = {
        description: 'brendan'
      };
      dbhelper.updateTicketById(1, ticketInfo)
        .then((ticket) => {
          expect(ticket).to.exist;
          expect(ticket['title']).to.equal('testticket');
          expect(ticket['description']).to.equal('brendan');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a ticket that does not exist', (done) => {
      var ticketInfo = {
        title: 'nonexistentticket',
        status: 'in progress',
        priority: 1,
        created_at: knex.fn.now(),
        creator_id: 1,
        assignee_handle: 'stevepkuo2',
        panel_id: 1,
        board_id: 1
      };
      dbhelper.updateTicketById(9, ticketInfo)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getTicketsByUser()', () => {
    it('Should exist', () => {
      expect(dbhelper.getTicketsByUser).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getTicketsByUser).to.be.a('function');
    });
    it('Should return an array of tickets assigned to user', (done) => {
      dbhelper.getTicketsByUser(1)
        .then((tickets) => {
          expect(tickets).to.exist;
          expect(Array.isArray(tickets)).to.be.true;
          expect(tickets.length).to.equal(1);
          expect(tickets[0]['title']).to.equal('testticket');
          expect(tickets[0]['status']).to.equal('in progress');
          expect(tickets[0]['type']).to.equal('feature');
          expect(tickets[0]['creator_id']).to.equal(1);
          expect(tickets[0]['assignee_handle']).to.equal('stevepkuo');
          expect(tickets[0]['panel_id']).to.equal(1);
          expect(tickets[0]['board_id']).to.equal(1);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should sort tickets by status, then priority', (done) => {
      dbhelper.getTicketsByUser(3)
        .then((tickets) => {
          expect(tickets).to.exist;
          expect(tickets[0]['title']).to.equal('testticket3C');
          expect(tickets[1]['title']).to.equal('testticket3B');
          expect(tickets[2]['title']).to.equal('testticket3A');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a user that does not exist', (done) => {
      dbhelper.getTicketsByUser(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });
  describe('getTicketsByPanel()', () => {
    it('Should exist', () => {
      expect(dbhelper.getTicketsByPanel).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getTicketsByPanel).to.be.a('function');
    });
    it('Should return an array of tickets assigned to panel', (done) => {
      dbhelper.getTicketsByPanel(1)
        .then((tickets) => {
          expect(tickets).to.exist;
          expect(Array.isArray(tickets)).to.be.true;
          expect(tickets.length).to.equal(1);
          expect(tickets[0]['title']).to.equal('testticket');
          expect(tickets[0]['status']).to.equal('in progress');
          expect(tickets[0]['type']).to.equal('feature');
          expect(tickets[0]['created_at']).to.be.a('date');
          expect(tickets[0]['creator_id']).to.equal(1);
          expect(tickets[0]['assignee_handle']).to.equal('stevepkuo');
          expect(tickets[0]['panel_id']).to.equal(1);
          expect(tickets[0]['board_id']).to.equal(1);
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should sort tickets by status, then priority', (done) => {
      dbhelper.getTicketsByPanel(3)
        .then((tickets) => {
          expect(tickets).to.exist;
          expect(tickets[0]['title']).to.equal('testticket3C');
          expect(tickets[1]['title']).to.equal('testticket3B');
          expect(tickets[2]['title']).to.equal('testticket3A');
          done();
        })
        .catch((err) => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should reject if passed a panel that does not exist', (done) => {
      dbhelper.getTicketsByPanel(9)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

});

describe('Invites', () => {
  beforeEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollbackMigrate(done);
      });
  });

  afterEach(function (done) {
    knex('knex_migrations_lock').where('is_locked', '1').del()
      .then(() => {
        dbUtils.rollback(done);
      });
  });

  describe('handleExists()', () => {
    it('Should exist', () => {
      expect(dbhelper.handleExists).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.handleExists).to.be.a('function');
    });
    it('Should say if githandle exists in users db table', (done) => {
      dbhelper.handleExists('stevepkuo')
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(true);
          done();
        })
        .error((err) => done(err));
    });
    it('Should say if githandle doesnt exist in users db table', (done) => {
      dbhelper.handleExists('nonexistentpersonblahblah')
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(false);
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('emailExists()', () => {
    it('Should exist', () => {
      expect(dbhelper.emailExists).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.emailExists).to.be.a('function');
    });
    it('Should say if email exists in users db table', (done) => {
      dbhelper.emailExists('blah@aol.com')
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(true);
          done();
        })
        .error((err) => done(err));
    });
    it('Should say if email doesnt exist in users db table', (done) => {
      dbhelper.emailExists('nonexistent@aol.com')
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(false);
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('verifiedEmail()', () => {
    it('Should exist', () => {
      expect(dbhelper.verifiedEmail).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.verifiedEmail).to.be.a('function');
    });
    it('Should say true if email exists with verified status 1', (done) => {
      dbhelper.verifiedEmail('blah@aol.com')
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(true);
          done();
        })
        .error((err) => done(err));
    });
    it('Should say false if email doesnt exist at all in users db table', (done) => {
      dbhelper.verifiedEmail('nonexistent@aol.com')
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(false);
          done();
        })
        .error((err) => done(err));
    });
    it('Should say false if email exists but has verified status 0', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user.github_handle).to.equal('dummyuser');
          return dbhelper.verifiedEmail('baseball@aol.com');
        })
        .then((boolean) => {
          expect(boolean).to.exist;
          expect(boolean).to.equal(false);
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('inviteByBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.inviteByBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.inviteByBoard).to.be.a('function');
    });
    it('Should invite user successfully', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          done();
        })
        .error((err) => done(err));
    });
    it('Should not fail if try to invite duplicate user', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('stevepkuo', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('duplicate invite'); //a duplicate message
          done();
        })
        .error((err) => done(err));
    });
    it('Should fail if try to invite nonexistent user', (done) => {
      dbhelper.inviteByBoard('nonexistentpersonblahblah', 2)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should fail if try to invite to nonexistent board', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 200)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('inviteEmailByBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.inviteEmailByBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.inviteEmailByBoard).to.be.a('function');
    });
    it('Should invite user successfully', (done) => {
      dbhelper.inviteEmailByBoard('blah@aol.com', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          done();
        })
        .error((err) => done(err));
    });
    it('Should not fail if try to invite duplicate user', (done) => {
      dbhelper.inviteEmailByBoard('blah@aol.com', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteEmailByBoard('blah@aol.com', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('duplicate invite'); //a duplicate message
          done();
        })
        .error((err) => done(err));
    });
    it('Should fail if try to invite nonexistent user', (done) => {
      dbhelper.inviteEmailByBoard('nonexistentpersonblahblah@aol.com', 2)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should fail if try to invite to nonexistent board', (done) => {
      dbhelper.inviteEmailByBoard('blah@aol.com', 200)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
  });

  describe('getInviteesByBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.getInviteesByBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getInviteesByBoard).to.be.a('function');
    });
    it('Should reject if board doesnt exist', (done) => {
      dbhelper.getInviteesByBoard(200)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should show no invitees initially', (done) => {
      dbhelper.getInviteesByBoard(2)
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(0); //blank array
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 1 invitee after inviting 1 person', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser');
          return dbhelper.inviteByBoard('dummyuser', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInviteesByBoard(2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1);
          expect(result[0].github_handle).to.equal('dummyuser');
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 2 invitees after inviting 2 people', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      var profileInfo2 = {
        github_handle: 'dummyuser2',
        profile_photo: 'http://www.mypic2.com',
        oauth_id: '54321',
        email: 'baseball2@aol.com',
        api_key: 'blah2',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser');
          return dbhelper.createUser(profileInfo2);
        })
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser2');
          return dbhelper.inviteByBoard('dummyuser', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('dummyuser2', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInviteesByBoard(2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(2);
          expect(result[0].github_handle).to.equal('dummyuser');
          expect(result[1].github_handle).to.equal('dummyuser2');
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('uninviteByBoard()', () => {
    it('Should exist', () => {
      expect(dbhelper.uninviteByBoard).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.uninviteByBoard).to.be.a('function');
    });
    it('Should reject if user doesnt exist', (done) => {
      dbhelper.uninviteByBoard('nonexistentpersonblahblah', 2)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should not reject if user is already not in board', (done) => {
      dbhelper.uninviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('user already not in invitee list'); //a duplicate message
          done();
        })
        .error((err) => done(err));
    });
    it('Should uninvite invitee after inviting 1 person', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getRecentlyAdded();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1); //array of 1
          expect(result[0].github_handle).to.equal('stevepkuo');
          return dbhelper.uninviteByBoard('stevepkuo', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(0); //empty array is sucessful
          return dbhelper.getRecentlyAdded();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(0);
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('getInvitees()', () => {
    it('Should exist', () => {
      expect(dbhelper.getInvitees).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getInvitees).to.be.a('function');
    });
    it('Should show 0 invites initially', (done) => {
      dbhelper.getInvitees()
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(0); //blank array
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 1 invitee after inviting 1 person', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser');
          return dbhelper.inviteByBoard('dummyuser', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInvitees();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1);
          expect(result[0].github_handle).to.equal('dummyuser');
          expect(result[0].invitedToBoards.length).to.equal(1);
          expect(result[0].invitedToBoards[0].board_name).to.equal('testboard2');
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 2 invitees after inviting 2 people', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      var profileInfo2 = {
        github_handle: 'dummyuser2',
        profile_photo: 'http://www.mypic2.com',
        oauth_id: '54321',
        email: 'baseball2@aol.com',
        api_key: 'blah2',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser');
          return dbhelper.createUser(profileInfo2);
        })
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser2');
          return dbhelper.inviteByBoard('dummyuser', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('dummyuser2', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInvitees();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(2);
          expect(result[0].github_handle).to.equal('dummyuser');
          expect(result[0].invitedToBoards.length).to.equal(1);
          expect(result[0].invitedToBoards[0].board_name).to.equal('testboard2');
          expect(result[1].github_handle).to.equal('dummyuser2');
          expect(result[1].invitedToBoards.length).to.equal(1);
          expect(result[1].invitedToBoards[0].board_name).to.equal('testboard2');
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 1 invitees with 2 boards after inviting 1 person to 2 boards', (done) => {
      var profileInfo = {
        github_handle: 'dummyuser',
        profile_photo: 'http://www.mypic.com',
        oauth_id: '12345',
        email: 'baseball@aol.com',
        api_key: 'blah',
        verified: 0
      };
      dbhelper.createUser(profileInfo)
        .then((user) => {
          expect(user).to.exist;
          expect(user['github_handle']).to.equal('dummyuser');
          return dbhelper.inviteByBoard('dummyuser', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('dummyuser', 3);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInvitees();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1);
          expect(result[0].github_handle).to.equal('dummyuser');
          expect(result[0].invitedToBoards.length).to.equal(2);
          expect(result[0].invitedToBoards[0].board_name).to.equal('testboard2');
          expect(result[0].invitedToBoards[1].board_name).to.equal('testboard3');
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('emailedInvites()', () => {
    it('Should exist', () => {
      expect(dbhelper.emailedInvites).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.emailedInvites).to.be.a('function');
    });
    it('Should work when there are 0 invites to search for', (done) => {
      dbhelper.emailedInvites([])
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('empty');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when invite id to update doesnt exist', (done) => {
      dbhelper.emailedInvites([0])
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('empty');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when there are 1 found invites to update', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.emailedInvites([1]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when updating 2 invites after inviting 2 people', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('dsc03', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.emailedInvites([1, 2]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when updating 2 invites for single person', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('stevepkuo', 3);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.emailedInvites([1, 2]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when there are 1 found and 1 unfound invites to update', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.emailedInvites([1, 200]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('deleteInvites()', () => {
    it('Should exist', () => {
      expect(dbhelper.deleteInvites).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.deleteInvites).to.be.a('function');
    });
    it('Should work when there are 0 invites to delete', (done) => {
      dbhelper.deleteInvites([])
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('empty');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when invite id to delete doesnt exist', (done) => {
      dbhelper.deleteInvites([0])
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('empty');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when there are 1 found invites to delete', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.deleteInvites([1]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when deleting 2 invites after inviting 2 people', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('dsc03', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.deleteInvites([1, 2]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when deleting 2 invites for single person', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('stevepkuo', 3);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.deleteInvites([1, 2]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
    it('Should work when there are 1 found and 1 unfound invites to delete', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.deleteInvites([1, 200]);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.equal('success');
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('getRecentlyAdded()', () => {
    it('Should exist', () => {
      expect(dbhelper.getRecentlyAdded).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getRecentlyAdded).to.be.a('function');
    });
    it('Should show 0 invites initially', (done) => {
      dbhelper.getRecentlyAdded()
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(0); //blank array
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 1 invitee after inviting 1 person', (done) => {
      dbhelper.inviteEmailByBoard('blah@aol.com', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getRecentlyAdded();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1);
          expect(result[0].github_handle).to.equal('stevepkuo');
          expect(result[0].invitedToBoards.length).to.equal(1);
          expect(result[0].invitedToBoards[0].board_name).to.equal('testboard2');
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 2 invitees after inviting 2 people', (done) => {
      dbhelper.inviteEmailByBoard('blah@aol.com', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteEmailByBoard('dsc03@aol.com', 2);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getRecentlyAdded();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(2);
          expect(result[0].github_handle).to.equal('stevepkuo');
          expect(result[0].invitedToBoards.length).to.equal(1);
          expect(result[0].invitedToBoards[0].board_name).to.equal('testboard2');
          expect(result[1].github_handle).to.equal('dsc03');
          expect(result[1].invitedToBoards.length).to.equal(1);
          expect(result[1].invitedToBoards[0].board_name).to.equal('testboard2');
          done();
        })
        .catch(err => {
          done(err);
        })
        .error((err) => done(err));
    });
    it('Should show 1 invitees with 2 boards after inviting 1 person to 2 boards', (done) => {
      dbhelper.inviteEmailByBoard('blah@aol.com', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteEmailByBoard('blah@aol.com', 3);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getRecentlyAdded();
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1);
          expect(result[0].github_handle).to.equal('stevepkuo');
          expect(result[0].invitedToBoards.length).to.equal(2);
          expect(result[0].invitedToBoards[0].board_name).to.equal('testboard2');
          expect(result[0].invitedToBoards[1].board_name).to.equal('testboard3');
          done();
        })
        .error((err) => done(err));
    });
  });

  describe('getInvitesByUser()', () => {
    it('Should exist', () => {
      expect(dbhelper.getInvitesByUser).to.exist;
    });
    it('Should be a function', () => {
      expect(dbhelper.getInvitesByUser).to.be.a('function');
    });
    it('Should reject if User doesnt exist', (done) => {
      dbhelper.getInvitesByUser(200)
        .then((result) => {
          expect('not thrown').to.equal('thrown error');
          done();
        })
        .catch((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        })
        .error((err) => {
          expect('thrown error').to.equal('thrown error');
          done();
        });
    });
    it('Should show no invited boards initially', (done) => {
      dbhelper.getInvitesByUser(1)
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(0); //blank array
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 1 invited board after inviting person to board', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInvitesByUser(1);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(1); //array of 1
          expect(result[0].board_name).to.equal('testboard2');
          done();
        })
        .error((err) => done(err));
    });
    it('Should show 2 invited boards after inviting same person to those', (done) => {
      dbhelper.inviteByBoard('stevepkuo', 2)
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.inviteByBoard('stevepkuo', 3);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result).to.not.equal('duplicate invite'); //a success object that is not a duplicate message
          return dbhelper.getInvitesByUser(1);
        })
        .then((result) => {
          expect(result).to.exist;
          expect(result.length).to.equal(2);
          expect(result[0].board_name).to.equal('testboard2');
          expect(result[1].board_name).to.equal('testboard3');
          done();
        })
        .error((err) => done(err));
    });
  });
});