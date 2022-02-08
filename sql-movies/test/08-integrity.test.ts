import _ from "lodash";
import { Database } from "../src/database";
import {
  selectGenreById,
  selectDirectorById,
  selectActorById,
  selectKeywordById,
  selectProductionCompanyById,
  selectMovieById
} from "../src/queries/select";
import { minutes } from "./utils";
import { ACTORS, DIRECTORS, GENRES, KEYWORDS, MOVIES, MOVIE_ACTORS, MOVIE_DIRECTORS, MOVIE_GENRES, MOVIE_KEYWORDS, MOVIE_PRODUCTION_COMPANIES, PRODUCTION_COMPANIES } from "../src/table-names";

describe("Foreign Keys", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("07", "08");
    await db.execute("PRAGMA foreign_keys = ON");
  }, minutes(3));

  it(
    "should not be able delete genres if any movie is linked",
    async done => {
      const genreId = 5;
      const query = `DELETE FROM ${GENRES}
                     WHERE genres.id = ${genreId}
                     AND genres.id NOT IN
                     (SELECT ${MOVIE_GENRES}.genre_id
                      FROM ${MOVIE_GENRES})`;
      try {
        await db.delete(query);
      } catch (e) {}

      const row = await db.selectSingleRow(selectGenreById(genreId));
      expect(row).toBeDefined();

      done();
    },
    minutes(10)
  );

  it(
    "should not be able delete director if any movie is linked",
    async done => {
      const directorId = 7;
      const query = `DELETE FROM ${DIRECTORS}
                     WHERE directors.id = ${directorId}
                     AND directors.id NOT IN
                     (SELECT ${MOVIE_DIRECTORS}.director_id
                      FROM ${MOVIE_DIRECTORS})`;
      try {
        await db.delete(query);
      } catch (e) {}

      const row = await db.selectSingleRow(selectDirectorById(directorId));
      expect(row).toBeDefined();

      done();
    },
    minutes(10)
  );

  it(
    "should not be able delete actor if any movie is linked",
    async done => {
      const actorId = 10;
      const query = `DELETE FROM ${ACTORS}
                     WHERE actors.id = ${actorId}
                     AND keywords.id NOT IN
                     (SELECT ${MOVIE_ACTORS}.keyword_id
                      FROM ${MOVIE_ACTORS})`;
      try {
        await db.delete(query);
      } catch (e) {}

      const row = await db.selectSingleRow(selectActorById(actorId));
      expect(row).toBeDefined();

      done();
    },
    minutes(10)
  );

  it(
    "should not be able delete keyword if any movie is linked",
    async done => {
      const keywordId = 12;
      const query = `DELETE FROM ${KEYWORDS}
                     WHERE keywords.id = ${keywordId}
                     AND keywords.id NOT IN
                      (SELECT ${MOVIE_KEYWORDS}.keyword_id
                       FROM ${MOVIE_KEYWORDS})`;
      try {
        await db.delete(query);
      } catch (e) {}

      const row = await db.selectSingleRow(selectKeywordById(keywordId));
      expect(row).toBeDefined();

      done();
    },
    minutes(10)
  );

  it(
    "should not be able delete production company if any movie is linked",
    async done => {
      const companyId = 12;
      const query = `DELETE FROM ${PRODUCTION_COMPANIES}
                     WHERE production_companies.id = ${companyId}
                     AND production_companies.id NOT IN
                        (SELECT ${MOVIE_PRODUCTION_COMPANIES}.company_id
                         FROM ${MOVIE_PRODUCTION_COMPANIES})`;
      try {
        await db.delete(query);
      } catch (e) {}

      const row = await db.selectSingleRow(
        selectProductionCompanyById(companyId)
      );
      expect(row).toBeDefined();

      done();
    },
    minutes(10)
  );

  it(
    "should not be able delete movie if there are any linked data present",
    async done => {
      const movieId = 100;
      const query = `DELETE FROM ${MOVIES}
                     WHERE movies.id = ${movieId}
                     AND movies.id NOT IN
                      (SELECT ${MOVIE_GENRES}.movie_id
                       FROM ${MOVIE_GENRES}) 
                     AND movies.id NOT IN
                      (SELECT ${MOVIE_ACTORS}.movie_id
                        FROM ${MOVIE_ACTORS}) 
                    AND movies.id NOT IN
                      (SELECT ${MOVIE_DIRECTORS}.movie_id
                        FROM ${MOVIE_DIRECTORS}) 
                    AND movies.id NOT IN
                      (SELECT ${MOVIE_KEYWORDS}.movie_id
                        FROM ${MOVIE_KEYWORDS}) 
                    AND movies.id NOT IN
                      (SELECT ${MOVIE_PRODUCTION_COMPANIES}.movie_id
                        FROM ${MOVIE_PRODUCTION_COMPANIES});`;
      try {
        await db.delete(query);
      } catch (e) {}

      const row = await db.selectSingleRow(selectMovieById(movieId));
      expect(row).toBeDefined();

      done();
    },
    minutes(10)
  );

  it(
    "should be able to delete movie",
    async done => {
      const movieId = 2000;
      const query = `DELETE FROM ${MOVIES}
      WHERE movies.id = ${movieId};
      DELETE FROM ${PRODUCTION_COMPANIES}
      WHERE production_companies.id = ${movieId};
      DELETE FROM ${KEYWORDS}
      WHERE keywords.id = ${movieId};
      DELETE FROM ${ACTORS}
      WHERE actors.id = ${movieId};
      DELETE FROM ${DIRECTORS}
      WHERE directors.id = ${movieId};
      DELETE FROM ${GENRES}
      WHERE genres.id = ${movieId};`;

      await db.delete(query);

      const row = await db.selectSingleRow(selectMovieById(movieId));
      expect(row).toBeUndefined();

      done();
    },
    minutes(10)
  );
});
