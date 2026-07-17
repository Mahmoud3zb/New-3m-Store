import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2 } from 'lucide-react';
import { reviewService } from '../../../services/reviewService';
import { useAuthStore } from '../../../store/authStore';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';
import { Skeleton } from '../../../components/ui/skeleton';

interface ProductReviewsProps {
  productId: string;
  reviews: any[];
  isLoadingReviews: boolean;
}

export function ProductReviews({ productId, reviews, isLoadingReviews }: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<string>('');

  const addReviewMutation = useMutation({
    mutationFn: (data: { rate: number; comment?: string }) =>
      reviewService.addReview(productId, data.rate, data.comment),
    onSuccess: () => {
      setReviewSuccess(language === 'ar' ? 'تم إضافة تقييمك بنجاح! شكراً لك.' : 'Your review was successfully added! Thank you.');
      setComment('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || (language === 'ar' ? 'فشل إضافة التقييم. يرجى المحاولة لاحقاً.' : 'Failed to add review. Please try again later.');
      setReviewError(errMsg);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    addReviewMutation.mutate({ rate: rating, comment });
  };

  return (
    <div className="border-t border-neutral-100 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Column: Reviews List */}
      <div className="lg:col-span-7 space-y-6">
        <h3 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-4">
          {t.reviewsTitle} ({reviews.length})
        </h3>

        {isLoadingReviews ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 rounded-2xl w-full" />
            <Skeleton className="h-20 rounded-2xl w-full" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-neutral-200/80 rounded-2xl">
            {t.noReviews}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => {
              const authorName = typeof rev.userID === 'object' && rev.userID 
                ? (rev.userID as any).name 
                : (language === 'ar' ? 'عميل 3M' : '3M Customer');
              const isAuthor = user && (typeof rev.userID === 'object' && rev.userID 
                ? (rev.userID as any)._id === user._id 
                : rev.userID === user._id);

              return (
                <div key={rev._id} className="bg-neutral-50/30 border border-neutral-100/60 rounded-2xl p-5 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block mb-1">{authorName}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(rev.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rate ? 'fill-current text-amber-500' : 'text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {rev.comment}
                  </p>

                  {(isAuthor || user?.role === 'admin') && (
                    <button
                      onClick={() => deleteReviewMutation.mutate(rev._id)}
                      className={`absolute bottom-4 text-red-500 hover:text-red-700 transition-colors p-1.5 bg-white rounded-lg border border-neutral-100 shadow-sm cursor-pointer ${language === 'ar' ? 'left-4' : 'right-4'}`}
                      title={t.deleteReview}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

     
      <div className="lg:col-span-5 bg-neutral-50/50 border border-neutral-100/80 rounded-3xl p-6 md:p-8">
        <h3 className="text-base font-bold text-neutral-900 mb-6">{t.addReview}</h3>
        
        {!isAuthenticated ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-xs text-neutral-500">{t.loginToReview}</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 block">{t.ratingLabel}</label>
              <div className={`flex gap-1.5 text-neutral-200 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = 5 - i;
                  const isActive = rating >= starVal;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className={`p-0.5 hover:scale-110 transition-transform cursor-pointer ${
                        isActive ? 'text-amber-500' : 'text-neutral-200'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 block">{t.commentLabel}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                className={`w-full min-h-[100px] bg-white border border-neutral-200 rounded-xl p-3.5 text-xs text-neutral-800 focus:outline-none focus:border-black font-medium leading-relaxed resize-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
              />
            </div>

            {reviewError && (
              <p className="text-[11px] text-red-500 font-bold bg-red-50 border border-red-100 p-3 rounded-xl">{reviewError}</p>
            )}
            {reviewSuccess && (
              <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-3 rounded-xl">{reviewSuccess}</p>
            )}

            <button
              type="submit"
              disabled={addReviewMutation.isPending}
              className="w-full bg-neutral-900 hover:bg-black disabled:bg-neutral-400 text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
            >
              {addReviewMutation.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
