class ArticlesController < ApplicationController
  before_action :set_article, only: %i[ show edit update destroy ]

  # GET /articles
  def index
    @articles = Article.all
  end

  # GET /articles/1
  def show
  end

  # GET /articles/new
  def new
    @article = Article.new
  end

  # GET /articles/1/edit
  def edit
  end

  # POST /articles
  def create
    @article = Article.new(article_params)

    if @article.save
      redirect_to @article, notice: "Article was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /articles/1
  def update
    if @article.update(article_params)
      redirect_to @article, notice: "Article was successfully updated.", status: :see_other
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /articles/1
  def destroy
    @article.destroy!
    redirect_to articles_path, notice: "Article was successfully destroyed.", status: :see_other
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_article
      @article = Article.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def article_params
      params.expect(article: [ :title, :text ])
    end
end
